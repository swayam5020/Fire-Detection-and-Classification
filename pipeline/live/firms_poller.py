import os
import hashlib
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path

import pandas as pd
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

MAP_KEY = os.getenv("FIRMS_MAP_KEY")

if not MAP_KEY:
    raise RuntimeError("FIRMS_MAP_KEY is not set in .env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres@localhost:5432/sih26_ntro_db"
)

FIRMS_SOURCE = "VIIRS_NOAA20_NRT"

# India: west, south, east, north
INDIA_BBOX = "68.0,6.0,97.5,37.5"

# Last 24 hours
DAYS = 1

RAW_BACKUP_DIR = BASE_DIR / "data" / "live_raw"
RAW_BACKUP_DIR.mkdir(parents=True, exist_ok=True)

engine = create_engine(DATABASE_URL)


# ============================================================
# FETCH FIRMS
# ============================================================

def fetch_firms():

    url = (
        "https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
        f"{MAP_KEY}/"
        f"{FIRMS_SOURCE}/"
        f"{INDIA_BBOX}/"
        f"{DAYS}"
    )

    print("Fetching NASA FIRMS data...")
    print("Source:", FIRMS_SOURCE)
    print("Area: India")
    print("Period: last 24 hours")

    response = requests.get(
        url,
        timeout=120
    )

    response.raise_for_status()

    if not response.text.strip():
        return pd.DataFrame()

    return pd.read_csv(StringIO(response.text))


# ============================================================
# CLEAN / NORMALIZE RAW FIRMS
# ============================================================

def normalize(df):
    if df.empty:
        return df

    required_columns = [
        "latitude",
        "longitude",
        "bright_ti4",
        "scan",
        "track",
        "acq_date",
        "acq_time",
        "satellite",
        "instrument",
        "confidence",
        "version",
        "bright_ti5",
        "frp",
        "daynight",
    ]

    missing = [c for c in required_columns if c not in df.columns]

    if missing:
        raise RuntimeError(
            f"FIRMS response missing columns: {missing}\n"
            f"Received columns: {list(df.columns)}"
        )

    df = df[required_columns].copy()

    # Convert NASA NRT names to our database names
    df = df.rename(
        columns={
            "bright_ti4": "brightness",
            "bright_ti5": "bright_t31",
        }
    )

    numeric_columns = [
        "latitude",
        "longitude",
        "brightness",
        "scan",
        "track",
        "acq_time",
        "bright_t31",
        "frp",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    df["acq_date"] = pd.to_datetime(
        df["acq_date"],
        errors="coerce"
    ).dt.date

    df = df.dropna(
        subset=[
            "latitude",
            "longitude",
            "acq_date",
        ]
    )

    df = df[
        df["latitude"].between(-90, 90)
        & df["longitude"].between(-180, 180)
    ]

    return df.reset_index(drop=True)

# ============================================================
# EVENT HASH
# ============================================================

def make_event_hash(row):

    values = [
        row["latitude"],
        row["longitude"],
        row["acq_date"],
        row["acq_time"],
        row["satellite"],
        row["instrument"],
    ]

    raw_key = "|".join(
        str(value)
        for value in values
    )

    return hashlib.sha256(
        raw_key.encode("utf-8")
    ).hexdigest()


# ============================================================
# INSERT INTO POSTGRESQL
# ============================================================

def insert_new_rows(df):

    if df.empty:
        return 0

    inserted = 0

    with engine.begin() as conn:

        for _, row in df.iterrows():

            event_hash = make_event_hash(row)

            result = conn.execute(
                text(
                    """
                    INSERT INTO firms_raw_data (
                        latitude,
                        longitude,
                        brightness,
                        scan,
                        track,
                        acq_date,
                        acq_time,
                        satellite,
                        instrument,
                        confidence,
                        version,
                        bright_t31,
                        frp,
                        daynight,
                        received_at,
                        source,
                        event_hash
                    )
                    VALUES (
                        :latitude,
                        :longitude,
                        :brightness,
                        :scan,
                        :track,
                        :acq_date,
                        :acq_time,
                        :satellite,
                        :instrument,
                        :confidence,
                        :version,
                        :bright_t31,
                        :frp,
                        :daynight,
                        :received_at,
                        :source,
                        :event_hash
                    )
                    ON CONFLICT (event_hash)
                    DO NOTHING
                    """
                ),
                {
                    "latitude": row["latitude"],
                    "longitude": row["longitude"],
                    "brightness": row["brightness"],
                    "scan": row["scan"],
                    "track": row["track"],
                    "acq_date": row["acq_date"],
                    "acq_time": row["acq_time"],
                    "satellite": row["satellite"],
                    "instrument": row["instrument"],
                    "confidence": row["confidence"],
                    "version": row["version"],
                    "bright_t31": row["bright_t31"],
                    "frp": row["frp"],
                    "daynight": row["daynight"],
                    "received_at": datetime.now(timezone.utc),
                    "source": "NASA_FIRMS",
                    "event_hash": event_hash,
                },
            )

            inserted += result.rowcount

    return inserted


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 65)
    print("NASA FIRMS DYNAMIC POLLER")
    print("=" * 65)

    # 1. Receive
    raw_df = fetch_firms()

    print("Raw detections received:", len(raw_df))

    # 2. Normalize
    clean_df = normalize(raw_df)

    print("Valid detections:", len(clean_df))

    # 3. Keep a local raw backup
    if not clean_df.empty:

        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        backup_file = (
            RAW_BACKUP_DIR
            / f"firms_{timestamp}.csv"
        )

        clean_df.to_csv(
            backup_file,
            index=False
        )

        print("Backup saved:", backup_file)

    # 4. PostgreSQL
    inserted = insert_new_rows(clean_df)

    duplicates = len(clean_df) - inserted

    print("New rows inserted:", inserted)
    print("Duplicate rows skipped:", duplicates)

    print("=" * 65)
    print("FIRMS POLL COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    main()

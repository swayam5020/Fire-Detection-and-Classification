import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text


BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://paridhilalwani@localhost:5432/sih26_ntro_db"
)

engine = create_engine(DATABASE_URL)


def clean_firms_data():

    query = """
        SELECT
            id,
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
            cluster_id,
            received_at,
            source,
            event_hash
        FROM firms_raw_data
    """

    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)

    print("=" * 65)
    print("FIRMS CLEANING STAGE")
    print("=" * 65)

    print(f"Raw rows: {len(df)}")

    if df.empty:
        print("No raw FIRMS data available.")
        return

    # Remove exact duplicate events
    before = len(df)

    df = df.drop_duplicates(
        subset=["event_hash"]
    ).copy()

    duplicates_removed = before - len(df)

    # Remove invalid coordinates
    before = len(df)

    df = df[
        df["latitude"].between(-90, 90)
        & df["longitude"].between(-180, 180)
    ].copy()

    invalid_coordinates = before - len(df)

    # Remove rows without essential fire information
    before = len(df)

    df = df.dropna(
        subset=[
            "latitude",
            "longitude",
            "acq_date",
            "frp"
        ]
    ).copy()

    missing_removed = before - len(df)

    # Ensure numeric values
    numeric_columns = [
        "latitude",
        "longitude",
        "brightness",
        "scan",
        "track",
        "acq_time",
        "bright_t31",
        "frp"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # FRP must be non-negative
    before = len(df)

    df = df[
        df["frp"].notna()
        & (df["frp"] >= 0)
    ].copy()

    invalid_frp = before - len(df)

    df = df.reset_index(drop=True)

    # Save cleaned backup
    output_dir = BASE_DIR / "data" / "live_clean"
    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = (
        output_dir
        / f"firms_clean_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )

    df.to_csv(
        output_file,
        index=False
    )

    print(f"Duplicates removed: {duplicates_removed}")
    print(f"Invalid coordinates removed: {invalid_coordinates}")
    print(f"Missing essential values removed: {missing_removed}")
    print(f"Invalid FRP rows removed: {invalid_frp}")
    print(f"Clean rows: {len(df)}")
    print(f"Clean backup: {output_file}")

    print("=" * 65)
    print("FIRMS CLEANING COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    clean_firms_data()
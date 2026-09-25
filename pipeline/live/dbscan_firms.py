import os
from pathlib import Path

import pandas as pd
from sklearn.cluster import DBSCAN
from dotenv import load_dotenv
from sqlalchemy import create_engine, text


BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://paridhilalwani@localhost:5432/sih26_ntro_db"
)

engine = create_engine(DATABASE_URL)

# Same parameters as the existing proven pipeline
EPS = 0.01
MIN_SAMPLES = 2


def run_dbscan():

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
            event_hash
        FROM firms_raw_data
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
    """

    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)

    print("=" * 65)
    print("LIVE FIRMS DBSCAN")
    print("=" * 65)

    print(f"Input detections: {len(df)}")

    if df.empty:
        print("No data available for DBSCAN.")
        return

    coordinates = df[
        ["latitude", "longitude"]
    ].values

    dbscan = DBSCAN(
        eps=EPS,
        min_samples=MIN_SAMPLES,
        metric="euclidean"
    )

    labels = dbscan.fit_predict(coordinates)

    df["cluster_id"] = labels

    clustered = df[df["cluster_id"] != -1].copy()
    noise = df[df["cluster_id"] == -1].copy()

    clusters_found = (
        clustered["cluster_id"].nunique()
        if not clustered.empty
        else 0
    )

    print(f"EPS: {EPS}")
    print(f"MIN_SAMPLES: {MIN_SAMPLES}")
    print(f"Clusters found: {clusters_found}")
    print(f"Clustered detections: {len(clustered)}")
    print(f"Noise/unclustered: {len(noise)}")

    # Update cluster_id in the raw database
    with engine.begin() as conn:

        for _, row in df.iterrows():

            conn.execute(
                text("""
                    UPDATE firms_raw_data
                    SET cluster_id = :cluster_id
                    WHERE id = :id
                """),
                {
                    "cluster_id": int(row["cluster_id"]),
                    "id": int(row["id"])
                }
            )

    output_dir = BASE_DIR / "data" / "live_clustered"
    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = (
        output_dir
        / f"firms_clustered_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )

    df.to_csv(
        output_file,
        index=False
    )

    print(f"Clustered backup: {output_file}")

    print("=" * 65)
    print("LIVE DBSCAN COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    run_dbscan()
import os
import glob
import math
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "live_persistence"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# DATABASE
# ============================================================

load_dotenv(
    os.path.join(BASE_DIR, ".env")
)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

engine = create_engine(DATABASE_URL)

# ============================================================
# READ CLUSTERED FIRMS DATA
# ============================================================

query = """
SELECT
    cluster_id,
    latitude,
    longitude,
    acq_date,
    frp
FROM firms_raw_data
WHERE cluster_id IS NOT NULL
  AND cluster_id != -1
ORDER BY cluster_id, acq_date;
"""

df = pd.read_sql(query, engine)

if df.empty:
    raise ValueError(
        "No clustered FIRMS detections found."
    )

df["acq_date"] = pd.to_datetime(
    df["acq_date"]
)

# ============================================================
# SPATIAL SPREAD
# SAME APPROACH AS EXISTING SCRIPT
# ============================================================

def calculate_spatial_spread(group):

    lat_range = (
        group["latitude"].max()
        - group["latitude"].min()
    )

    lon_range = (
        group["longitude"].max()
        - group["longitude"].min()
    )

    lat_km = lat_range * 111.0
    lon_km = lon_range * 111.0

    return math.sqrt(
        lat_km ** 2 +
        lon_km ** 2
    )

# ============================================================
# PERSISTENCE FEATURES
# ============================================================

results = []

for cluster_id, group in df.groupby(
    "cluster_id"
):

    group = group.sort_values(
        "acq_date"
    )

    detection_count = len(group)

    unique_days = (
        group["acq_date"]
        .dt.date
        .nunique()
    )

    first_detection = (
        group["acq_date"].min()
    )

    last_detection = (
        group["acq_date"].max()
    )

    observation_window_days = (
        last_detection -
        first_detection
    ).days + 1

    spatial_spread_km = (
        calculate_spatial_spread(group)
    )

    temporal_recurrence = (
        unique_days /
        observation_window_days
    )

    duration_score = (
        unique_days / 5
    )

    duration_score = min(
        duration_score,
        1.0
    )

    detection_frequency = (
        detection_count /
        observation_window_days
    )

    spatial_consistency = (
        1 /
        (1 + spatial_spread_km)
    )

    persistence_score = (
        temporal_recurrence * 30
        +
        duration_score * 30
        +
        spatial_consistency * 40
    )

    if persistence_score >= 70:

        persistence_label = (
            "HIGH / PERSISTENT"
        )

    elif persistence_score >= 50:

        persistence_label = (
            "MEDIUM / RECURRENT"
        )

    else:

        persistence_label = (
            "LOW / TRANSIENT"
        )

    # ========================================================
    # CLUSTER CENTROID
    # ========================================================

    centroid_lat = (
        group["latitude"].mean()
    )

    centroid_lon = (
        group["longitude"].mean()
    )

    results.append({

        "cluster_id": int(cluster_id),

        "detection_count": detection_count,

        "unique_detection_days": unique_days,

        "observation_window_days":
            observation_window_days,

        "spatial_spread_km":
            spatial_spread_km,

        "temporal_recurrence":
            temporal_recurrence,

        "duration_score":
            duration_score,

        "detection_frequency":
            detection_frequency,

        "spatial_consistency":
            spatial_consistency,

        "persistence_score":
            persistence_score,

        "persistence_label":
            persistence_label,

        "first_detection":
            first_detection.date(),

        "last_detection":
            last_detection.date(),

        "centroid_lat":
            centroid_lat,

        "centroid_lon":
            centroid_lon
    })

# ============================================================
# DATAFRAME
# ============================================================

result_df = pd.DataFrame(
    results
)

# ============================================================
# SAVE
# ============================================================

timestamp = pd.Timestamp.now().strftime(
    "%Y%m%d_%H%M%S"
)

output_file = os.path.join(
    OUTPUT_DIR,
    f"firms_persistence_{timestamp}.csv"
)

result_df.to_csv(
    output_file,
    index=False
)

# ============================================================
# SUMMARY
# ============================================================

print("=" * 60)
print("LIVE PERSISTENCE COMPLETE")
print("=" * 60)

print(
    f"Clustered detections: {len(df)}"
)

print(
    f"Clusters processed: {len(result_df)}"
)

print()

print(
    result_df[
        "persistence_label"
    ].value_counts()
)

print()

print(
    "Centroid coordinates added:"
)

print(
    result_df[
        [
            "cluster_id",
            "centroid_lat",
            "centroid_lon"
        ]
    ].head()
)

print()

print(
    f"Persistence backup: {output_file}"
)

print("=" * 60)

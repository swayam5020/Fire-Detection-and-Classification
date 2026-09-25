import pandas as pd
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parents[2]

PERSISTENCE_FILE = BASE_DIR / "data/live_persistence/firms_persistence_20260926_005606.csv"
CLUSTERED_FILE = BASE_DIR / "data/live_clustered/firms_clustered_20260926_005047.csv"
WORLDCOVER_FILE = BASE_DIR / "data/live_worldcover/firms_worldcover_20260926_005939.csv"
PROXIMITY_FILE = BASE_DIR / "data/live_industrial_proximity/firms_industrial_proximity_20260926_010526.csv"

OUTPUT_DIR = BASE_DIR / "data/live_ml_input"

FINAL_COLUMNS = [
    "detection_count",
    "mean_frp",
    "max_frp",
    "mean_brightness",
    "max_brightness",
    "unique_detection_days",
    "observation_window_days",
    "spatial_spread_km",
    "temporal_recurrence",
    "duration_score",
    "detection_frequency",
    "spatial_consistency",
    "persistence_score",
    "land_cover_code",
    "is_cropland",
    "is_tree_cover",
    "is_built_up",
    "cropland_percentage",
    "tree_cover_percentage",
    "built_up_percentage",
    "grassland_percentage",
    "shrubland_percentage",
    "bare_sparse_percentage",
    "nearest_industrial_distance_km",
    "nearby_industrial_facility_count",
    "nearby_industrial_capacity_mw",
    "fire_class",
    "cluster_id",
    "centroid_lat",
    "centroid_lon",
]


def main():

    print("=" * 70)
    print("BUILD LIVE 30-COLUMN ML INPUT")
    print("=" * 70)

    persistence = pd.read_csv(PERSISTENCE_FILE)
    clustered = pd.read_csv(CLUSTERED_FILE)
    worldcover = pd.read_csv(WORLDCOVER_FILE)
    proximity = pd.read_csv(PROXIMITY_FILE)

    print(f"Persistence rows: {len(persistence)}")
    print(f"Clustered FIRMS rows: {len(clustered)}")
    print(f"WorldCover rows: {len(worldcover)}")
    print(f"Proximity rows: {len(proximity)}")

    # ---------------------------------------------------------
    # Raw FIRMS aggregate features per cluster
    # ---------------------------------------------------------

    clustered["frp"] = pd.to_numeric(
        clustered["frp"],
        errors="coerce"
    )

    clustered["brightness"] = pd.to_numeric(
        clustered["brightness"],
        errors="coerce"
    )

    firms_features = (
        clustered[clustered["cluster_id"] >= 0]
        .groupby("cluster_id")
        .agg(
            mean_frp=("frp", "mean"),
            max_frp=("frp", "max"),
            mean_brightness=("brightness", "mean"),
            max_brightness=("brightness", "max"),
        )
        .reset_index()
    )

    print(f"FIRMS feature clusters: {len(firms_features)}")

    # ---------------------------------------------------------
    # Persistence features
    # ---------------------------------------------------------

    persistence_cols = [
        "cluster_id",
        "detection_count",
        "unique_detection_days",
        "observation_window_days",
        "spatial_spread_km",
        "temporal_recurrence",
        "duration_score",
        "detection_frequency",
        "spatial_consistency",
        "persistence_score",
        "centroid_lat",
        "centroid_lon",
    ]

    persistence = persistence[persistence_cols].copy()

    # ---------------------------------------------------------
    # WorldCover
    # ---------------------------------------------------------

    worldcover_cols = [
        "cluster_id",
        "land_cover_code",
        "is_cropland",
        "is_tree_cover",
        "is_built_up",
        "cropland_percentage",
        "tree_cover_percentage",
        "built_up_percentage",
        "grassland_percentage",
        "shrubland_percentage",
        "bare_sparse_percentage",
    ]

    worldcover = worldcover[worldcover_cols].copy()

    # ---------------------------------------------------------
    # Industrial proximity
    # ---------------------------------------------------------

    proximity_cols = [
        "cluster_id",
        "nearest_industrial_distance_km",
        "nearby_industrial_facility_count",
        "nearby_industrial_capacity_mw",
    ]

    proximity = proximity[proximity_cols].copy()

    # ---------------------------------------------------------
    # Merge everything
    # ---------------------------------------------------------

    df = persistence.merge(
        firms_features,
        on="cluster_id",
        how="left",
        validate="one_to_one"
    )

    df = df.merge(
        worldcover,
        on="cluster_id",
        how="left",
        validate="one_to_one"
    )

    df = df.merge(
        proximity,
        on="cluster_id",
        how="left",
        validate="one_to_one"
    )

    # Live FIRMS detections are not yet classified.
    df["fire_class"] = "UNKNOWN"

    # ---------------------------------------------------------
    # Exact 30-column order
    # ---------------------------------------------------------

    df = df[FINAL_COLUMNS]

    # ---------------------------------------------------------
    # Numeric conversion
    # ---------------------------------------------------------

    numeric_columns = [
        column
        for column in FINAL_COLUMNS
        if column != "fire_class"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # ---------------------------------------------------------
    # Validation
    # ---------------------------------------------------------

    print()
    print("=" * 70)
    print("VALIDATION")
    print("=" * 70)

    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    print()
    print("Missing values:")

    missing = df.isna().sum()

    if missing.sum() == 0:
        print("NONE")
    else:
        print(missing[missing > 0].to_string())

    if len(df.columns) != 30:
        raise ValueError(
            f"Expected 30 columns, got {len(df.columns)}"
        )

    if list(df.columns) != FINAL_COLUMNS:
        raise ValueError(
            "Column order does not match exact 30-column schema."
        )

    # ---------------------------------------------------------
    # Save
    # ---------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    output_file = (
        OUTPUT_DIR /
        f"live_30_attributes_{timestamp}.csv"
    )

    df.to_csv(
        output_file,
        index=False
    )

    print()
    print("=" * 70)
    print("LIVE 30-COLUMN ML INPUT COMPLETE")
    print("=" * 70)

    print(f"Output: {output_file}")
    print(f"Shape: {df.shape}")

    print()
    print(df.to_string(index=False))

    print()
    print("=" * 70)


if __name__ == "__main__":
    main()

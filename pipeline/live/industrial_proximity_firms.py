import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime
from sklearn.neighbors import BallTree

BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_DIR = BASE_DIR / "data" / "live_persistence"
OUTPUT_DIR = BASE_DIR / "data" / "live_industrial_proximity"

FACILITY_FILE = (
    BASE_DIR
    / "data"
    / "infrastructure"
    / "india_industrial_power_facilities.csv"
)

RADIUS_KM = 10.0
EARTH_RADIUS_KM = 6371.0


def find_latest_file(folder):
    files = sorted(folder.glob("firms_persistence_*.csv"))

    if not files:
        raise FileNotFoundError(
            f"No persistence files found in {folder}"
        )

    return files[-1]


def main():

    print("=" * 70)
    print("LIVE INDUSTRIAL FACILITY PROXIMITY")
    print("=" * 70)

    input_file = find_latest_file(INPUT_DIR)

    print(f"Persistence input: {input_file}")

    df = pd.read_csv(input_file)

    print(f"Input clusters: {len(df)}")

    facilities = pd.read_csv(FACILITY_FILE)

    print(f"Industrial facilities: {len(facilities)}")
    print(f"Search radius: {RADIUS_KM} km")

    # ---------------------------------------------------------
    # Correct facility columns
    # ---------------------------------------------------------

    LAT_COL = "latitude"
    LON_COL = "longitude"
    CAPACITY_COL = "total_capacity_mw"

    facilities[LAT_COL] = pd.to_numeric(
        facilities[LAT_COL],
        errors="coerce"
    )

    facilities[LON_COL] = pd.to_numeric(
        facilities[LON_COL],
        errors="coerce"
    )

    facilities[CAPACITY_COL] = pd.to_numeric(
        facilities[CAPACITY_COL],
        errors="coerce"
    ).fillna(0.0)

    facilities = facilities.dropna(
        subset=[LAT_COL, LON_COL]
    ).copy()

    # ---------------------------------------------------------
    # Build BallTree
    # ---------------------------------------------------------

    facility_coords = np.radians(
        facilities[[LAT_COL, LON_COL]].values
    )

    tree = BallTree(
        facility_coords,
        metric="haversine"
    )

    radius_rad = RADIUS_KM / EARTH_RADIUS_KM

    results = []

    # ---------------------------------------------------------
    # Process each live cluster
    # ---------------------------------------------------------

    for _, row in df.iterrows():

        cluster_id = int(row["cluster_id"])

        lat = float(row["centroid_lat"])
        lon = float(row["centroid_lon"])

        point = np.radians([[lat, lon]])

        # Nearest facility
        nearest_distance, nearest_index = tree.query(
            point,
            k=1
        )

        nearest_distance_km = float(
            nearest_distance[0][0] * EARTH_RADIUS_KM
        )

        # Facilities within 10 km
        nearby_indices = tree.query_radius(
            point,
            r=radius_rad
        )[0]

        nearby = facilities.iloc[nearby_indices]

        nearby_count = int(len(nearby))

        nearby_capacity_mw = float(
            nearby[CAPACITY_COL].sum()
        )

        results.append({
            "cluster_id": cluster_id,
            "centroid_lat": lat,
            "centroid_lon": lon,
            "nearest_industrial_distance_km":
                nearest_distance_km,
            "nearby_industrial_facility_count":
                nearby_count,
            "nearby_industrial_capacity_mw":
                nearby_capacity_mw
        })

    result_df = pd.DataFrame(results)

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
        OUTPUT_DIR
        / f"firms_industrial_proximity_{timestamp}.csv"
    )

    result_df.to_csv(
        output_file,
        index=False
    )

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    print()
    print("=" * 70)
    print("LIVE INDUSTRIAL PROXIMITY SUMMARY")
    print("=" * 70)

    print(
        f"Clusters processed: {len(result_df)}"
    )

    print(
        f"Clusters with nearby facilities: "
        f"{(result_df['nearby_industrial_facility_count'] > 0).sum()}"
    )

    print()

    print(
        result_df[
            [
                "cluster_id",
                "centroid_lat",
                "centroid_lon",
                "nearest_industrial_distance_km",
                "nearby_industrial_facility_count",
                "nearby_industrial_capacity_mw"
            ]
        ].to_string(index=False)
    )

    print()
    print(
        f"Industrial proximity output: {output_file}"
    )

    print("=" * 70)
    print("LIVE INDUSTRIAL PROXIMITY COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()

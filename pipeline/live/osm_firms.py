from pathlib import Path
import glob
import time

import pandas as pd
import requests


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

PERSISTENCE_DIR = BASE_DIR / "data" / "live_persistence"
OUTPUT_DIR = BASE_DIR / "data" / "live_osm"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# OSM CONFIGURATION
# ============================================================

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

SEARCH_RADIUS_METERS = 5000
REQUEST_TIMEOUT = 90

HEADERS = {
    "User-Agent": "Fire_ML_New/1.0 (SIH project)",
    "Accept": "application/json",
}


# ============================================================
# FIND LATEST PERSISTENCE FILE
# ============================================================

files = sorted(
    glob.glob(
        str(PERSISTENCE_DIR / "firms_persistence_*.csv")
    )
)

if not files:
    raise FileNotFoundError(
        "No live persistence CSV found."
    )

INPUT_FILE = files[-1]


# ============================================================
# QUERY FUNCTION
# ============================================================

def query_industrial_features(lat, lon, radius=SEARCH_RADIUS_METERS):

    query = f"""
[out:json][timeout:60];

(
  node["landuse"="industrial"](around:{radius},{lat},{lon});
  way["landuse"="industrial"](around:{radius},{lat},{lon});
  relation["landuse"="industrial"](around:{radius},{lat},{lon});

  node["man_made"="works"](around:{radius},{lat},{lon});
  way["man_made"="works"](around:{radius},{lat},{lon});

  node["industrial"](around:{radius},{lat},{lon});
  way["industrial"](around:{radius},{lat},{lon});
);

out center;
"""

    response = requests.post(
        OVERPASS_URL,
        data={
            "data": query
        },
        headers=HEADERS,
        timeout=REQUEST_TIMEOUT
    )

    response.raise_for_status()

    data = response.json()

    return len(
        data.get("elements", [])
    )


# ============================================================
# LOAD INPUT
# ============================================================

print("=" * 70)
print("LIVE OSM INDUSTRIAL INFRASTRUCTURE")
print("=" * 70)

print(
    f"Persistence input: {INPUT_FILE}"
)

df = pd.read_csv(INPUT_FILE)

print(
    f"Input clusters: {len(df)}"
)

print(
    f"Search radius: {SEARCH_RADIUS_METERS / 1000:.1f} km"
)

print()


# ============================================================
# PROCESS
# ============================================================

results = []

success = 0
failed = 0

for _, row in df.iterrows():

    cluster_id = int(row["cluster_id"])

    lat = float(row["centroid_lat"])
    lon = float(row["centroid_lon"])

    print(
        f"Cluster {cluster_id}: "
        f"{lat:.6f}, {lon:.6f}"
    )

    try:

        count = query_industrial_features(
            lat,
            lon
        )

        print(
            f"  Industrial OSM features: {count}"
        )

        success += 1

    except Exception as e:

        print(
            f"  Query failed: {e}"
        )

        count = None
        failed += 1

    results.append({
        "cluster_id": cluster_id,
        "centroid_lat": lat,
        "centroid_lon": lon,
        "osm_industrial_feature_count": count
    })

    time.sleep(1)


# ============================================================
# SAVE
# ============================================================

results_df = pd.DataFrame(results)

timestamp = pd.Timestamp.now().strftime(
    "%Y%m%d_%H%M%S"
)

OUTPUT_FILE = (
    OUTPUT_DIR /
    f"firms_osm_{timestamp}.csv"
)

results_df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("LIVE OSM SUMMARY")
print("=" * 70)

print(
    f"Clusters: {len(results_df)}"
)

print(
    f"Successful queries: {success}"
)

print(
    f"Failed queries: {failed}"
)

print()

print(
    results_df.to_string(index=False)
)

print()

print(
    f"OSM output: {OUTPUT_FILE}"
)

print()
print("=" * 70)
print("LIVE OSM COMPLETE")
print("=" * 70)

import os
import glob
import numpy as np
import pandas as pd
import rasterio
from dotenv import load_dotenv

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../..")
)

PERSISTENCE_DIR = os.path.join(
    BASE_DIR,
    "data",
    "live_persistence"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "live_worldcover"
)

WORLDCOVER_DIR = os.path.join(
    BASE_DIR,
    "data",
    "worldcover"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# SETTINGS
# ============================================================

RADIUS_KM = 1.0
PIXEL_SIZE_METERS = 10

RADIUS_PIXELS = int(
    (RADIUS_KM * 1000) / PIXEL_SIZE_METERS
)

# ============================================================
# FIND LATEST PERSISTENCE FILE
# ============================================================

files = sorted(
    glob.glob(
        os.path.join(
            PERSISTENCE_DIR,
            "firms_persistence_*.csv"
        )
    )
)

if not files:
    raise FileNotFoundError(
        "No live persistence CSV found."
    )

persistence_file = files[-1]

print("=" * 60)
print("LIVE WORLDCOVER LAND-COVER EXTRACTION")
print("=" * 60)
print(f"Persistence input: {persistence_file}")
print(f"Radius: {RADIUS_KM} km")
print(f"Radius pixels: {RADIUS_PIXELS}")
print()

df = pd.read_csv(persistence_file)

# ============================================================
# FIND WORLDCOVER TILES
# ============================================================

tile_files = sorted(
    glob.glob(
        os.path.join(
            WORLDCOVER_DIR,
            "**",
            "*.tif"
        ),
        recursive=True
    )
)

if not tile_files:
    raise FileNotFoundError(
        "No WorldCover .tif files found under data/worldcover/"
    )

print(f"WorldCover tiles found: {len(tile_files)}")

# ============================================================
# INITIALISE FEATURES
# ============================================================

df["land_cover_code"] = np.nan

df["is_cropland"] = 0
df["is_tree_cover"] = 0
df["is_built_up"] = 0

df["cropland_percentage"] = 0.0
df["tree_cover_percentage"] = 0.0
df["built_up_percentage"] = 0.0
df["grassland_percentage"] = 0.0
df["shrubland_percentage"] = 0.0
df["bare_sparse_percentage"] = 0.0

# ============================================================
# PROCESS EACH CLUSTER
# ============================================================

processed = 0
skipped = 0

for idx, row in df.iterrows():

    latitude = float(row["centroid_lat"])
    longitude = float(row["centroid_lon"])

    matched_tile = None

    # --------------------------------------------------------
    # FIND TILE CONTAINING CENTROID
    # --------------------------------------------------------

    for tile_file in tile_files:

        try:

            with rasterio.open(tile_file) as src:

                if (
                    src.bounds.left <= longitude <= src.bounds.right
                    and
                    src.bounds.bottom <= latitude <= src.bounds.top
                ):
                    matched_tile = tile_file
                    break

        except Exception:
            continue

    if matched_tile is None:

        skipped += 1
        continue

    # --------------------------------------------------------
    # OPEN MATCHED TILE
    # --------------------------------------------------------

    try:

        with rasterio.open(matched_tile) as src:

            row_index, col_index = src.index(
                longitude,
                latitude
            )

            # ------------------------------------------------
            # CENTER LAND COVER
            # ------------------------------------------------

            if (
                0 <= row_index < src.height
                and
                0 <= col_index < src.width
            ):

                land_cover_code = int(
                    src.read(
                        1,
                        window=rasterio.windows.Window(
                            col_index,
                            row_index,
                            1,
                            1
                        )
                    )[0, 0]
                )

                df.at[
                    idx,
                    "land_cover_code"
                ] = land_cover_code

                df.at[
                    idx,
                    "is_cropland"
                ] = int(
                    land_cover_code == 40
                )

                df.at[
                    idx,
                    "is_tree_cover"
                ] = int(
                    land_cover_code == 10
                )

                df.at[
                    idx,
                    "is_built_up"
                ] = int(
                    land_cover_code == 50
                )

            # ------------------------------------------------
            # 1 KM ENVIRONMENT WINDOW
            # ------------------------------------------------

            row_start = max(
                0,
                row_index - RADIUS_PIXELS
            )

            row_end = min(
                src.height,
                row_index + RADIUS_PIXELS + 1
            )

            col_start = max(
                0,
                col_index - RADIUS_PIXELS
            )

            col_end = min(
                src.width,
                col_index + RADIUS_PIXELS + 1
            )

            window = rasterio.windows.Window(
                col_start,
                row_start,
                col_end - col_start,
                row_end - row_start
            )

            data = src.read(
                1,
                window=window
            )

            pixels = data.flatten()

            # ------------------------------------------------
            # REMOVE NODATA
            # ------------------------------------------------

            if src.nodata is not None:

                pixels = pixels[
                    pixels != src.nodata
                ]

            total_pixels = len(pixels)

            # ------------------------------------------------
            # CALCULATE PERCENTAGES
            # ------------------------------------------------

            if total_pixels > 0:

                df.at[
                    idx,
                    "cropland_percentage"
                ] = (
                    np.sum(pixels == 40)
                    / total_pixels
                    * 100
                )

                df.at[
                    idx,
                    "tree_cover_percentage"
                ] = (
                    np.sum(pixels == 10)
                    / total_pixels
                    * 100
                )

                df.at[
                    idx,
                    "built_up_percentage"
                ] = (
                    np.sum(pixels == 50)
                    / total_pixels
                    * 100
                )

                df.at[
                    idx,
                    "grassland_percentage"
                ] = (
                    np.sum(pixels == 30)
                    / total_pixels
                    * 100
                )

                df.at[
                    idx,
                    "shrubland_percentage"
                ] = (
                    np.sum(pixels == 20)
                    / total_pixels
                    * 100
                )

                df.at[
                    idx,
                    "bare_sparse_percentage"
                ] = (
                    np.sum(pixels == 60)
                    / total_pixels
                    * 100
                )

            processed += 1

    except Exception as e:

        print(
            f"WARNING: Could not process "
            f"cluster {row.get('cluster_id')}: {e}"
        )

        skipped += 1

# ============================================================
# SAVE
# ============================================================

timestamp = pd.Timestamp.now().strftime(
    "%Y%m%d_%H%M%S"
)

output_file = os.path.join(
    OUTPUT_DIR,
    f"firms_worldcover_{timestamp}.csv"
)

df.to_csv(
    output_file,
    index=False
)

# ============================================================
# SUMMARY
# ============================================================

print()
print(f"Input clusters: {len(df)}")
print(f"WorldCover processed: {processed}")
print(f"Skipped: {skipped}")

print()
print("Missing values:")
print(
    df[
        [
            "land_cover_code",
            "is_cropland",
            "is_tree_cover",
            "is_built_up",
            "cropland_percentage",
            "tree_cover_percentage",
            "built_up_percentage",
            "grassland_percentage",
            "shrubland_percentage",
            "bare_sparse_percentage"
        ]
    ].isna().sum()
)

print()
print(f"WorldCover output: {output_file}")
print()
print("=" * 60)
print("LIVE WORLDCOVER COMPLETE")
print("=" * 60)

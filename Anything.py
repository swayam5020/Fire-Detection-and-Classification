import geopandas as gpd

osm = gpd.read_file("/Users/swayamsharma/Desktop/Vizak Data.geojson")

print(osm.head())
print(osm.columns)
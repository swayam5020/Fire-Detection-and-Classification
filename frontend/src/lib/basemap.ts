import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';

/**
 * Loads a simplified world-countries basemap fully offline (bundled via the
 * world-atlas package) and converts it to GeoJSON at runtime. This avoids any
 * dependency on a third-party raster/vector tile server or API key, and keeps
 * the map's visual style — flat country shapes on a near-black field —
 * entirely under our control.
 */
export async function loadWorldCountries(): Promise<FeatureCollection<Geometry>> {
  const topology = (await import('world-atlas/countries-110m.json')) as unknown as Topology;
  const collection = topology.objects.countries as GeometryCollection;
  return feature(topology, collection) as unknown as FeatureCollection<Geometry>;
}

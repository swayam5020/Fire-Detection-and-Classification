import type { StyleSpecification } from 'maplibre-gl';

/**
 * Satellite basemap for /map.
 *
 * Sentinel-2 cloudless imagery (EOX) as the ground, a subtle hillshade off
 * an open DEM for relief, and OpenFreeMap's vector tiles on top for roads,
 * boundaries and place labels. All three are free and keyless.
 *
 * Deliberately no contour lines and no 3D terrain — the hillshade is plan
 * view only. The imagery is nudged slightly darker and desaturated so the
 * thermal anomaly markers stay legible against it.
 */

const VECTOR_TILES = 'https://tiles.openfreemap.org/planet';
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

// Free for non-commercial use under CC BY-NC-SA 4.0; commercial use needs a
// paid licence from EOX. The attribution below is mandatory.
const SATELLITE_TILES = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg';

// Terrarium-encoded DEM from the AWS Open Data terrain tiles bucket.
const TERRAIN_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

const SATELLITE_SOURCE_ID = 'satellite';
const TERRAIN_SOURCE_ID = 'terrain-dem';

/** Mandatory EOX credit — must stay visible wherever the imagery shows. */
export const EOX_ATTRIBUTION =
  '<a href="https://cloudless.eox.at" target="_blank" rel="noopener">EOxCloudless</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2020)';

export const TERRAIN_ATTRIBUTION =
  '<a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">AWS Terrain Tiles</a>';

const VOID = '#0A2021'; // shown before imagery loads / beyond coverage
const BOUNDARY = '#2FD1BE';
const BOUNDARY_SUB = '#2A6F6B';
const ROAD_MOTORWAY = '#3FE0CE';
const ROAD_MAJOR = '#22B3A2';
const ROAD_MINOR = '#1B8E80';
const ROAD_SERVICE = '#16665F';
const LABEL = '#F2ECD8';
const LABEL_MUTED = '#A8CFC8';
const HALO = '#06100F';

export const SATELLITE_TERRAIN_STYLE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    openmaptiles: { type: 'vector', url: VECTOR_TILES },
    [SATELLITE_SOURCE_ID]: {
      type: 'raster',
      tiles: [SATELLITE_TILES],
      tileSize: 256,
      maxzoom: 14,
      attribution: EOX_ATTRIBUTION,
    },
    [TERRAIN_SOURCE_ID]: {
      type: 'raster-dem',
      tiles: [TERRAIN_TILES],
      tileSize: 256,
      maxzoom: 14,
      encoding: 'terrarium',
      attribution: TERRAIN_ATTRIBUTION,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': VOID } },

    {
      id: 'satellite',
      type: 'raster',
      source: SATELLITE_SOURCE_ID,
      paint: {
        'raster-opacity': 1,
        // Keeps the imagery real but a touch calmer, so the risk-coloured
        // markers and cyan linework read clearly on top.
        'raster-brightness-max': 0.82,
        'raster-saturation': -0.15,
        'raster-contrast': 0.05,
      },
    },

    // Relief only — plan view, no contours, no exaggeration.
    {
      id: 'hillshade',
      type: 'hillshade',
      source: TERRAIN_SOURCE_ID,
      paint: {
        'hillshade-exaggeration': 0.25,
        'hillshade-shadow-color': '#03100E',
        'hillshade-highlight-color': '#BFE8DF',
        'hillshade-accent-color': '#0A2021',
      },
    },

    {
      id: 'boundary-state',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['all', ['>=', ['get', 'admin_level'], 3], ['<=', ['get', 'admin_level'], 6]],
      paint: { 'line-color': BOUNDARY_SUB, 'line-width': 0.6, 'line-dasharray': [3, 2], 'line-opacity': 0.7 },
    },
    {
      id: 'boundary-country',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['<=', ['get', 'admin_level'], 2],
      paint: {
        'line-color': BOUNDARY,
        'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 6, 1.2, 12, 2],
        'line-opacity': 0.8,
      },
    },

    // Roads, thinnest class first so majors draw on top.
    {
      id: 'road-service',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 12,
      filter: ['match', ['get', 'class'], ['service', 'track', 'path'], true, false],
      paint: {
        'line-color': ROAD_SERVICE,
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.3, 18, 2],
        'line-opacity': 0.8,
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 10,
      filter: ['match', ['get', 'class'], ['minor', 'tertiary'], true, false],
      paint: {
        'line-color': ROAD_MINOR,
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.4, 14, 1.2, 18, 4],
        'line-opacity': 0.85,
      },
    },
    {
      id: 'road-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 7,
      filter: ['match', ['get', 'class'], ['primary', 'secondary'], true, false],
      paint: {
        'line-color': ROAD_MAJOR,
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.5, 10, 1, 14, 2.5, 18, 6],
        'line-opacity': 0.9,
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 5,
      filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
      paint: {
        'line-color': ROAD_MOTORWAY,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 8, 1.2, 12, 2.5, 18, 7],
        'line-opacity': 0.9,
      },
    },

    {
      id: 'water-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      minzoom: 5,
      layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': 11 },
      paint: { 'text-color': LABEL_MUTED, 'text-halo-color': HALO, 'text-halo-width': 1.2 },
    },
    {
      id: 'road-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 13,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
        'symbol-placement': 'line',
      },
      paint: { 'text-color': LABEL_MUTED, 'text-halo-color': HALO, 'text-halo-width': 1.2 },
    },
    {
      id: 'place-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['match', ['get', 'class'], ['city', 'town', 'village', 'country', 'state'], true, false],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 8, 13, 14, 16],
        'text-max-width': 8,
      },
      paint: { 'text-color': LABEL, 'text-halo-color': HALO, 'text-halo-width': 1.6 },
    },
  ],
};

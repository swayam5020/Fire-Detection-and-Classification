/**
 * Types describing the intelligence produced by the backend pipeline:
 * NASA FIRMS -> OSM infrastructure join -> persistence + DBSCAN ->
 * ML classification -> risk engine -> PostGIS -> FastAPI.
 *
 * The frontend treats every field here as backend-provided. No risk
 * scoring, classification, or clustering logic is computed client-side.
 */

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type ClassificationType =
  | 'industrial_fire'
  | 'wildfire'
  | 'agricultural_burn'
  | 'flare_stack'
  | 'persistent_industrial_source'
  | 'unknown';

export interface ClusterCentroid {
  lat: number;
  lon: number;
}

/**
 * The pipeline's geospatial join knows how far the nearest industrial facility
 * is — that distance is what drives the risk engine — but does not always
 * resolve which facility it is. Name and type are therefore nullable while
 * distance, the field the risk score actually depends on, is not.
 */
export interface AdjacentFacility {
  name: string | null;
  facility_type: string | null;
  distance_km: number;
}

/**
 * Ground-sensor telemetry from an ESP32 unit co-located with a cluster, when
 * one is deployed there. Not every cluster has a ground sensor — fields (and
 * the object itself) are null when no reading exists, and the UI renders
 * that as "—" rather than inventing a value.
 */
export interface Esp32Telemetry {
  temperature_c: number | null;
  humidity_pct: number | null;
  smoke_level: 'low' | 'medium' | 'high' | null;
}

/**
 * Fields are nullable where the live backend may not supply them. The API
 * currently returns a subset of this shape (see `src/api/adapters.ts`), and
 * the rule throughout the UI is the same one the ESP32 tiles already follow:
 * a value the backend did not send renders as "—", never as a placeholder,
 * a zero, or an invented figure.
 *
 * A field is non-nullable only where the backend is guaranteed to provide it:
 * identity, position, risk band, classification, and persistence.
 */
export interface ThermalCluster {
  cluster_id: string;
  centroid: ClusterCentroid;
  region: string | null;

  risk_score: number | null; // 0-100, backend-computed
  risk_level: RiskLevel;
  risk_reasons: string[]; // empty when the backend sends no reasoning
  classification: ClassificationType;
  classification_label: string;
  classification_probability: number; // 0-1

  frp: number | null; // Fire Radiative Power, MW
  brightness: number | null; // Kelvin, FIRMS channel 21/31
  confidence: number | null; // FIRMS detection confidence, 0-100

  timestamp: string | null; // ISO 8601, most recent detection
  first_detected: string | null; // ISO 8601
  last_detected: string | null; // ISO 8601
  duration_hours: number | null;
  persistence_score: number; // 0-100

  facility: AdjacentFacility | null;
  esp32: Esp32Telemetry | null;
}

export interface ClusterFilters {
  riskLevels: RiskLevel[];
  classifications: ClassificationType[];
  timeRange: '24h' | '7d' | '30d' | 'custom';
  customRange?: { start: string; end: string } | null; // ISO 'YYYY-MM-DD' dates
}

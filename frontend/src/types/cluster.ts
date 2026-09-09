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

export interface AdjacentFacility {
  name: string;
  facility_type: string;
  distance_km: number;
}

export interface ThermalCluster {
  cluster_id: string;
  centroid: ClusterCentroid;
  region: string;

  risk_score: number; // 0-100, backend-computed
  risk_level: RiskLevel;
  risk_reasons: string[];

  classification: ClassificationType;
  classification_label: string;
  classification_probability: number; // 0-1

  frp: number; // Fire Radiative Power, MW
  brightness: number; // Kelvin, FIRMS channel 21/31
  confidence: number; // FIRMS detection confidence, 0-100

  timestamp: string; // ISO 8601, most recent detection
  first_detected: string; // ISO 8601
  last_detected: string; // ISO 8601
  duration_hours: number;
  persistence_score: number; // 0-100

  facility: AdjacentFacility | null;
}

export interface ClusterFilters {
  riskLevels: RiskLevel[];
  classifications: ClassificationType[];
  timeRange: '24h' | '7d' | '30d' | 'custom';
  customRange?: { start: string; end: string } | null; // ISO 'YYYY-MM-DD' dates
}

import type { ThermalCluster, ClassificationType, RiskLevel, AdjacentFacility } from '@/types/cluster';
import { CLASSIFICATION_LABELS } from '@/lib/classification';

/**
 * Translation layer between the FastAPI backend (`ml_model/main.py`) and the
 * `ThermalCluster` shape the UI is built against. This is the only module that
 * knows the backend's field names, so a rename on their side is a one-file fix
 * here rather than a change to every page.
 *
 * GET /api/thermal-map returns GeoJSON, one Feature per cluster. The endpoint
 * currently exposes six properties; every other field the UI can display is
 * declared optional below so that when the backend starts sending it, it flows
 * through with no further frontend work. Anything absent maps to null and the
 * UI renders "—" — nothing here substitutes a default, a zero, or an estimate.
 */

export interface ThermalMapProperties {
  // --- Always present in the current response ---
  cluster_id: number | string;
  ai_prediction: string;
  /** ANN softmax probability, 0-100. Not the same as FIRMS sensor confidence. */
  confidence: number;
  persistence_score: number;
  nearby_industry_mw: number;
  risk_level: string;

  // --- Optional: present only once the backend exposes them ---
  /** Produced by fire_engine.FireAnalysisEngine, which main.py does not yet call. */
  risk_score?: number;
  risk_reason?: string[];
  max_frp?: number;
  max_brightness?: number;
  /** FIRMS detection confidence, distinct from the ANN's `confidence` above. */
  firms_confidence?: number;
  nearest_industrial_distance_km?: number;
  nearest_industrial_facility_name?: string;
  nearest_industrial_facility_type?: string;
  region?: string;
  timestamp?: string;
  first_detected?: string;
  last_detected?: string;
}

export interface ThermalMapFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: ThermalMapProperties;
}

export interface ThermalMapResponse {
  type: 'FeatureCollection';
  features: ThermalMapFeature[];
}

/** FastAPI returns `{ error: "..." }` with a 200 when a handler catches. */
export interface BackendErrorResponse {
  error?: string;
  status?: string;
  message?: string;
}

/**
 * The model emits three classes. The remaining ClassificationType members stay
 * in the union because the UI's type filter supports them, but the current
 * model will never produce one — anything unrecognised falls to 'unknown'
 * rather than being forced into a neighbouring category.
 */
const CLASSIFICATION_BY_PREDICTION: Record<string, ClassificationType> = {
  INDUSTRIAL: 'industrial_fire',
  AGRICULTURAL: 'agricultural_burn',
  WILDFIRE: 'wildfire',
};

/**
 * fire_engine.py grades five bands; the UI has four. The two most severe
 * bands both surface as 'critical' — collapsing downward would understate
 * a disaster-level event, which is the one direction that must not happen.
 */
const RISK_LEVEL_BY_LABEL: Record<string, RiskLevel> = {
  'DISASTER / SEVERE EMERGENCY': 'critical',
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Maximum score _evaluate_risk can award: 30 (FRP) + 20 (persistence) +
 * 20 (spread) + 30 (industrial proximity) + 20 (plant capacity) + 25
 * (built-up exposure). The UI's bars and readouts are 0-100, so scores are
 * rescaled from this range.
 *
 * NOTE: if the backend is ever changed to emit a 0-100 score directly, this
 * rescale must be removed or every score will read ~31% low.
 */
const FIRE_ENGINE_MAX_SCORE = 145;

function toClassification(prediction: string | null | undefined): ClassificationType {
  if (!prediction) return 'unknown';
  return CLASSIFICATION_BY_PREDICTION[prediction.trim().toUpperCase()] ?? 'unknown';
}

function toRiskLevel(label: string | null | undefined): RiskLevel {
  if (!label) return 'low';
  return RISK_LEVEL_BY_LABEL[label.trim().toUpperCase()] ?? 'low';
}

/**
 * Backend cluster ids are numeric (0, 188, ...). The UI treats ids as opaque
 * strings and displays them directly, so they are formatted into the CL-0188
 * house style. The mapping is deterministic and reversible — no identity is
 * invented, only reformatted.
 */
function toClusterId(raw: number | string): string {
  if (typeof raw === 'string' && raw.trim().toUpperCase().startsWith('CL-')) {
    return raw.trim().toUpperCase();
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `CL-${String(Math.trunc(n)).padStart(4, '0')}`;
}

function toRiskScore(raw: number | undefined): number | null {
  if (raw == null || !Number.isFinite(raw)) return null;
  return Math.round(Math.min((raw / FIRE_ENGINE_MAX_SCORE) * 100, 100));
}

/**
 * Built whenever a proximity distance is known — that distance is what the
 * risk engine keys on and is worth surfacing even when the join could not
 * name the facility. Returns null when there is no distance at all.
 */
function toFacility(props: ThermalMapProperties): AdjacentFacility | null {
  const distance = props.nearest_industrial_distance_km;
  if (distance == null || !Number.isFinite(distance)) return null;
  return {
    name: props.nearest_industrial_facility_name ?? null,
    facility_type: props.nearest_industrial_facility_type ?? null,
    distance_km: distance,
  };
}

/** Real elapsed time between the first and last detection, when both are known. */
function toDurationHours(first: string | undefined, last: string | undefined): number | null {
  if (!first || !last) return null;
  const start = new Date(first).getTime();
  const end = new Date(last).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round(((end - start) / 3_600_000) * 10) / 10;
}

function toNullableNumber(raw: number | undefined): number | null {
  return raw == null || !Number.isFinite(raw) ? null : raw;
}

export function toThermalCluster(feature: ThermalMapFeature): ThermalCluster {
  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates; // GeoJSON is lon-first
  const classification = toClassification(props.ai_prediction);

  return {
    cluster_id: toClusterId(props.cluster_id),
    centroid: { lat, lon },
    region: props.region ?? null,

    risk_score: toRiskScore(props.risk_score),
    risk_level: toRiskLevel(props.risk_level),
    risk_reasons: props.risk_reason ?? [],

    classification,
    classification_label: CLASSIFICATION_LABELS[classification],
    classification_probability: props.confidence / 100,

    frp: toNullableNumber(props.max_frp),
    brightness: toNullableNumber(props.max_brightness),
    confidence: toNullableNumber(props.firms_confidence),

    timestamp: props.timestamp ?? props.last_detected ?? null,
    first_detected: props.first_detected ?? null,
    last_detected: props.last_detected ?? null,
    duration_hours: toDurationHours(props.first_detected, props.last_detected),
    persistence_score: Math.round(props.persistence_score),

    facility: toFacility(props),

    // Ground telemetry is a separate, single-station endpoint
    // (GET /api/live-sensors) and is not reported per cluster. Attaching one
    // sensor's reading to every cluster would misrepresent where it was taken.
    esp32: null,
  };
}

/**
 * The live backend's cluster_id is not actually unique across the table —
 * its DBSCAN labeling resets per pipeline run, so id 0 (for example) can
 * point at dozens of unrelated real locations in the same response. That
 * breaks anything that looks a cluster up by id, most visibly
 * `clusters.find(c => c.cluster_id === selectedId)` on /map: clicking a
 * marker whose id collides with an earlier one shows the earlier one's
 * data instead.
 *
 * This is a stopgap, not a fix — the real fix is the backend assigning a
 * globally unique id. Disambiguating here only guarantees uniqueness
 * *within a single response*; a duplicate's suffixed id can shift between
 * requests if the backend returns rows in a different order. The first
 * occurrence of an id is left unsuffixed so the common case (ids that
 * are already unique) is untouched.
 */
export function toThermalClusters(response: ThermalMapResponse): ThermalCluster[] {
  if (!response || !Array.isArray(response.features)) return [];

  const seen = new Map<string, number>();
  return response.features.map((feature) => {
    const cluster = toThermalCluster(feature);
    const occurrence = (seen.get(cluster.cluster_id) ?? 0) + 1;
    seen.set(cluster.cluster_id, occurrence);
    return occurrence === 1 ? cluster : { ...cluster, cluster_id: `${cluster.cluster_id}-${occurrence}` };
  });
}

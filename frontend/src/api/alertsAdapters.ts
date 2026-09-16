import type { SosAlert } from '@/types/alert';
import type { RiskLevel, ThermalCluster } from '@/types/cluster';

/**
 * Wire shape of GET /api/alerts (ml_model/main.py). One entry per cluster at
 * or above the backend's alert severity floor, derived from the same
 * real risk analysis /api/thermal-map uses — not a separate data source.
 */
export interface BackendAlert {
  alert_id: string;
  severity: string;
  location: string;
  timestamp: string | null;
  cluster_id: string;
  reason: string;
  status: string;
  automated_assessment: string;
  recommended_actions: string[] | null;
  assigned_team: string | null;
  assigned_team_status: string | null;
  log_timeline: unknown[];
}

const VALID_SEVERITIES: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
const VALID_STATUSES: SosAlert['status'][] = ['active', 'acknowledged', 'resolved'];
const VALID_TEAM_STATUSES: NonNullable<SosAlert['assigned_team_status']>[] = ['on_call', 'dispatched', 'standby'];

function toSeverity(raw: string): RiskLevel {
  const v = raw.toLowerCase();
  return (VALID_SEVERITIES as string[]).includes(v) ? (v as RiskLevel) : 'low';
}

function toStatus(raw: string): SosAlert['status'] {
  const v = raw.toLowerCase();
  return (VALID_STATUSES as string[]).includes(v) ? (v as SosAlert['status']) : 'active';
}

function toTeamStatus(raw: string | null): SosAlert['assigned_team_status'] {
  if (raw == null) return null;
  const v = raw.toLowerCase();
  return (VALID_TEAM_STATUSES as string[]).includes(v) ? (v as SosAlert['assigned_team_status']) : null;
}

/**
 * The backend's alert.cluster_id is the raw, ungrouped identifier
 * (e.g. "0.0") — not the "CL-0000" (and deduped "CL-0000-2", ...) form
 * `adapters.ts` produces for ThermalCluster.cluster_id from the same
 * underlying, non-unique backend id. The two never match as strings, so
 * anything that cross-references an alert to its cluster by id (active-case
 * derivation, "View on Map") silently fails.
 *
 * The fix isn't reformatting the alert's id in isolation — a duplicate's
 * dedup suffix depends on where it falls in *that specific* /api/thermal-map
 * response, which /api/alerts (a different, filtered response) can't
 * reproduce on its own. Instead, each alert is matched to its real cluster
 * by location — both are computed from the same centroid_lat/lon, so a
 * close-enough coordinate match reliably identifies the same underlying row
 * — and adopts *that* cluster's already-resolved id directly.
 */
const COORDINATE_MATCH_TOLERANCE = 0.001; // ~100m; backend location is formatted to 4 decimal places

function findMatchingCluster(location: string, clusters: ThermalCluster[]): ThermalCluster | undefined {
  const [latStr, lonStr] = location.split(',').map((s) => s.trim());
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;

  return clusters.find(
    (c) =>
      Math.abs(c.centroid.lat - lat) < COORDINATE_MATCH_TOLERANCE &&
      Math.abs(c.centroid.lon - lon) < COORDINATE_MATCH_TOLERANCE
  );
}

export function toSosAlert(raw: BackendAlert, clusters: ThermalCluster[]): SosAlert {
  const matched = findMatchingCluster(raw.location, clusters);

  return {
    alert_id: raw.alert_id,
    severity: toSeverity(raw.severity),
    location: raw.location,
    timestamp: raw.timestamp,
    // Falls back to a raw, unmatched id only if the clusters list hasn't
    // loaded yet or genuinely contains no coordinate-matching row — this
    // alert just won't cross-reference as "active" until that resolves.
    cluster_id: matched ? matched.cluster_id : raw.cluster_id,
    reason: raw.reason,
    status: toStatus(raw.status),
    automated_assessment: raw.automated_assessment,
    recommended_actions: raw.recommended_actions,
    assigned_team: raw.assigned_team,
    assigned_team_status: toTeamStatus(raw.assigned_team_status),
    log_timeline: [], // backend sends none; no persisted event history exists yet
  };
}

export function toSosAlerts(raw: BackendAlert[], clusters: ThermalCluster[]): SosAlert[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => toSosAlert(a, clusters));
}

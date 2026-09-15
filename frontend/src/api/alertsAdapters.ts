import type { SosAlert } from '@/types/alert';
import type { RiskLevel } from '@/types/cluster';

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

export function toSosAlert(raw: BackendAlert): SosAlert {
  return {
    alert_id: raw.alert_id,
    severity: toSeverity(raw.severity),
    location: raw.location,
    timestamp: raw.timestamp,
    cluster_id: raw.cluster_id,
    reason: raw.reason,
    status: toStatus(raw.status),
    automated_assessment: raw.automated_assessment,
    recommended_actions: raw.recommended_actions,
    assigned_team: raw.assigned_team,
    assigned_team_status: toTeamStatus(raw.assigned_team_status),
    log_timeline: [], // backend sends none; no persisted event history exists yet
  };
}

export function toSosAlerts(raw: BackendAlert[]): SosAlert[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(toSosAlert);
}

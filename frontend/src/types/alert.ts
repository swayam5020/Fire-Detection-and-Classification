import type { RiskLevel } from './cluster';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface LogEntry {
  timestamp: string; // ISO 8601
  message: string;
}

/**
 * The backend derives alerts from real cluster risk output (see
 * ml_model/main.py's GET /api/alerts) — there is no separate alerts table,
 * and specifically no persisted acknowledgement workflow or dispatch
 * system anywhere in the pipeline. Fields with no real source are nullable
 * and render as "—" / hidden, the same convention ThermalCluster.esp32
 * already uses, rather than being filled with invented team names or
 * response text.
 */
export interface SosAlert {
  alert_id: string;
  severity: RiskLevel;
  location: string;
  timestamp: string | null; // ISO 8601 — null: no detection-time column exists in processed_data
  cluster_id: string;
  reason: string;
  status: AlertStatus;

  // Detail-panel fields
  automated_assessment: string; // always derivable from real model output
  recommended_actions: string[] | null; // null: no dispatch-protocol source
  assigned_team: string | null; // null: no dispatch system
  assigned_team_status: 'on_call' | 'dispatched' | 'standby' | null;
  log_timeline: LogEntry[]; // empty: no persisted event history for this alert
}

export interface NotificationState {
  hasUnread: boolean;
  unreadCount: number;
}

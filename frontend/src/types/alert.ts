import type { RiskLevel } from './cluster';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface LogEntry {
  timestamp: string; // ISO 8601
  message: string;
}

export interface SosAlert {
  alert_id: string;
  severity: RiskLevel;
  location: string;
  timestamp: string; // ISO 8601
  cluster_id: string;
  reason: string;
  status: AlertStatus;

  // Detail-panel fields
  automated_assessment: string;
  recommended_actions: string[];
  assigned_team: string;
  assigned_team_status: 'on_call' | 'dispatched' | 'standby';
  log_timeline: LogEntry[];
}

export interface NotificationState {
  hasUnread: boolean;
  unreadCount: number;
}

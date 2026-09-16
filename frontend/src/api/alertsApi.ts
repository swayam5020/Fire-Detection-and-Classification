import type { SosAlert, NotificationState } from '@/types/alert';
import type { ThermalCluster } from '@/types/cluster';
import { mockAlerts } from '@/mock/alerts';
import { toSosAlerts, type BackendAlert } from './alertsAdapters';

/**
 * Live backend: GET /api/alerts and /api/alerts/notifications on
 * ml_model/main.py. Both are derived from real cluster risk data — there is
 * no separate alerts table. Fields with no real source (dispatch team,
 * recommended actions, event history) come back null/empty and render as
 * "—" / hidden; see the comment on SosAlert in src/types/alert.ts.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const NETWORK_DELAY_MS = 450;

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * `clusters` is needed to resolve each alert's cluster_id to the same
 * deduped id ThermalCluster uses — see the comment on toSosAlert. Pass
 * whatever the caller's current clusters list is; an empty/stale list just
 * means alerts won't cross-reference as active until a fresher one arrives.
 */
export async function fetchAlerts(clusters: ThermalCluster[]): Promise<SosAlert[]> {
  if (USE_MOCK) {
    return delay(mockAlerts);
  }

  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch alerts: ${res.status}`);
  }
  const body = (await res.json()) as BackendAlert[];
  return toSosAlerts(body, clusters);
}

export async function fetchNotificationState(): Promise<NotificationState> {
  if (USE_MOCK) {
    const activeCritical = mockAlerts.filter((a) => a.status === 'active').length;
    return delay({ hasUnread: activeCritical > 0, unreadCount: activeCritical });
  }

  const res = await fetch(`${API_BASE}/api/alerts/notifications`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notification state: ${res.status}`);
  }
  return res.json();
}

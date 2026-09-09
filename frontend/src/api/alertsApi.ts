import type { SosAlert, NotificationState } from '@/types/alert';
import { mockAlerts } from '@/mock/alerts';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const USE_MOCK = true; // flip to false once FastAPI backend is reachable

const NETWORK_DELAY_MS = 450;

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchAlerts(): Promise<SosAlert[]> {
  if (USE_MOCK) {
    return delay(mockAlerts);
  }

  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch alerts: ${res.status}`);
  }
  return res.json();
}

export async function fetchNotificationState(): Promise<NotificationState> {
  if (USE_MOCK) {
    const activeCritical = mockAlerts.filter((a) => a.status === 'active').length;
    return delay({ hasUnread: activeCritical > 0, unreadCount: activeCritical });
  }

  const res = await fetch(`${API_BASE}/alerts/notifications`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notification state: ${res.status}`);
  }
  return res.json();
}

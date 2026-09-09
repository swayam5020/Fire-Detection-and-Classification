import { useEffect, useState } from 'react';
import type { NotificationState } from '@/types/alert';
import { fetchNotificationState } from '@/api/alertsApi';

export function useNotifications(): NotificationState {
  const [state, setState] = useState<NotificationState>({ hasUnread: false, unreadCount: 0 });

  useEffect(() => {
    let cancelled = false;
    fetchNotificationState().then((data) => {
      if (!cancelled) setState(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

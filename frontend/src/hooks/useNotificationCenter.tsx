import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from './useNotifications';

interface NotificationCenterValue {
  hasUnread: boolean;
  unreadCount: number;
  /** True once the person has visited /alert since this notification arrived. */
  acknowledged: boolean;
}

const NotificationCenterContext = createContext<NotificationCenterValue>({
  hasUnread: false,
  unreadCount: 0,
  acknowledged: true,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Sourced from the same mock/FastAPI-ready notification endpoint the
  // bell always used — acknowledgment is purely a UI-side derivation on
  // top of it, not a separate data source.
  const { hasUnread, unreadCount } = useNotifications();
  const [acknowledged, setAcknowledged] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/alert' && hasUnread) {
      setAcknowledged(true);
    }
  }, [location.pathname, hasUnread]);

  return (
    <NotificationCenterContext.Provider value={{ hasUnread, unreadCount, acknowledged }}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter(): NotificationCenterValue {
  return useContext(NotificationCenterContext);
}

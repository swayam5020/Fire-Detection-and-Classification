import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { SosAlert } from '@/types/alert';
import { useNotifications } from './useNotifications';
import { useAlertArrivals } from './useAlertArrivals';
import { useClusters, type AsyncStatus } from './useClusters';

interface NotificationCenterValue {
  hasUnread: boolean;
  unreadCount: number;
  /** True once the person has acknowledged the current unread alert(s) —
   * by opening the SOS modal, or (still supported) visiting /alert. */
  acknowledged: boolean;
  /** Live alerts snapshot (same poll that detects arrivals) — the SOS
   * modal reads this rather than fetching its own separate copy, so it's
   * never stale relative to the arrival that just opened it. */
  alerts: SosAlert[];
  alertsStatus: AsyncStatus;
  alertsError: string | null;
  /** A newly-arrived alert the ringing banner should announce, or null. */
  latestArrival: SosAlert | null;
  isSosModalOpen: boolean;
  openSosModal: () => void;
  closeSosModal: () => void;
}

const NotificationCenterContext = createContext<NotificationCenterValue>({
  hasUnread: false,
  unreadCount: 0,
  acknowledged: true,
  alerts: [],
  alertsStatus: 'loading',
  alertsError: null,
  latestArrival: null,
  isSosModalOpen: false,
  openSosModal: () => {},
  closeSosModal: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Sourced from the same mock/FastAPI-ready notification endpoint the
  // bell always used — acknowledgment is purely a UI-side derivation on
  // top of it, not a separate data source.
  const { hasUnread, unreadCount } = useNotifications();
  // Needed only so alerts can be cross-referenced to their cluster's actual
  // (deduped) id — see the comment on alertsAdapters.toSosAlert. This is the
  // one place in the app that fetches clusters purely for that purpose,
  // rather than to render them.
  const { clusters } = useClusters();
  // Polls the same alerts source the rest of the app reads, diffing for
  // arrivals the ringing overlay should announce — see useAlertArrivals.
  const { alerts, status: alertsStatus, error: alertsError, latestArrival, clearArrival } = useAlertArrivals(clusters);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const location = useLocation();

  // Visiting /alert directly still counts as acknowledging, same as before.
  useEffect(() => {
    if (location.pathname === '/alert' && hasUnread) {
      setAcknowledged(true);
    }
  }, [location.pathname, hasUnread]);

  const openSosModal = useCallback(() => {
    setIsSosModalOpen(true);
    setAcknowledged(true);
    clearArrival();
  }, [clearArrival]);

  const closeSosModal = useCallback(() => setIsSosModalOpen(false), []);

  return (
    <NotificationCenterContext.Provider
      value={{
        hasUnread,
        unreadCount,
        acknowledged,
        alerts,
        alertsStatus,
        alertsError,
        latestArrival,
        isSosModalOpen,
        openSosModal,
        closeSosModal,
      }}
    >
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter(): NotificationCenterValue {
  return useContext(NotificationCenterContext);
}

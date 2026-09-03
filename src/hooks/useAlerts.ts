import { useEffect, useState, useCallback } from 'react';
import type { SosAlert } from '@/types/alert';
import { fetchAlerts } from '@/api/alertsApi';
import type { AsyncStatus } from './useClusters';

interface UseAlertsResult {
  alerts: SosAlert[];
  status: AsyncStatus;
  error: string | null;
  refetch: () => void;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchAlerts()
      .then((data) => {
        if (cancelled) return;
        setAlerts(data);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load SOS alerts.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { alerts, status, error, refetch };
}

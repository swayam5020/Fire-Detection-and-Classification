import { useEffect, useRef, useState, useCallback } from 'react';
import type { SosAlert } from '@/types/alert';
import type { ThermalCluster } from '@/types/cluster';
import { fetchAlerts } from '@/api/alertsApi';
import type { AsyncStatus } from './useClusters';

interface UseAlertsResult {
  alerts: SosAlert[];
  status: AsyncStatus;
  error: string | null;
  refetch: () => void;
}

/**
 * `clusters` resolves each alert's cluster_id to match ThermalCluster's —
 * see alertsAdapters.toSosAlert. Callers already have this from their own
 * useClusters() call (AlertsPage needs it for other reasons anyway), so
 * it's passed in rather than fetched again here.
 */
export function useAlerts(clusters: ThermalCluster[]): UseAlertsResult {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  // Same rationale as useAlertArrivals: read the latest clusters via a ref
  // rather than making this effect depend on `clusters` directly, so a
  // fresh (but unchanged) array reference from useClusters() doesn't
  // trigger a refetch.
  const clustersRef = useRef(clusters);
  clustersRef.current = clusters;

  // ...but the effect DOES need to re-run once clusters first has data:
  // it fires immediately on mount, while clusters is still `[]` (its own
  // fetch hasn't resolved yet), so a ref-only read would resolve every
  // alert's cluster_id against an empty list. This flips false→true
  // exactly once, so it re-runs the fetch once when real data becomes
  // available — not on every later clusters refresh.
  const hasClusters = clusters.length > 0;

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchAlerts(clustersRef.current)
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
  }, [reloadKey, hasClusters]);

  return { alerts, status, error, refetch };
}

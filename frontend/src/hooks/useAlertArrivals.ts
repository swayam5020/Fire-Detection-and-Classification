import { useEffect, useRef, useState, useCallback } from 'react';
import type { SosAlert } from '@/types/alert';
import { fetchAlerts } from '@/api/alertsApi';
import { compareTimestampsDesc } from '@/lib/utils';
import type { AsyncStatus } from './useClusters';

const POLL_MS = 20000;

interface UseAlertArrivalsResult {
  /** Live alerts snapshot, kept current by the same poll that detects
   * arrivals — the single source the SOS overlay and modal both read, so
   * the modal never shows a copy that's older than the arrival that just
   * opened it. */
  alerts: SosAlert[];
  status: AsyncStatus;
  error: string | null;
  /** The most recently arrived alert not yet seen this session, or null. */
  latestArrival: SosAlert | null;
  /** Clears latestArrival — call when the user has acted on it. */
  clearArrival: () => void;
}

/**
 * Polls the same fetchAlerts() every page already uses and diffs alert_ids
 * against what's been seen this session to detect genuinely new arrivals.
 * No alert data is invented here — this only re-reads the existing source
 * on an interval. The first poll establishes the baseline (nothing is
 * treated as "new" on initial load); only alert_ids that appear on a later
 * poll and weren't seen before trigger latestArrival.
 */
export function useAlertArrivals(): UseAlertArrivalsResult {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [latestArrival, setLatestArrival] = useState<SosAlert | null>(null);
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await fetchAlerts();
        if (cancelled) return;

        if (seenIds.current === null) {
          seenIds.current = new Set(data.map((a) => a.alert_id));
        } else {
          const unseen = data.filter((a) => !seenIds.current!.has(a.alert_id));
          if (unseen.length > 0) {
            unseen.forEach((a) => seenIds.current!.add(a.alert_id));
            // compareTimestampsDesc(a, latest) < 0 means a is more recent than latest
            // (undated arrivals never win over a dated one, but do beat nothing).
            const newest = unseen.reduce((latest, a) =>
              compareTimestampsDesc(a.timestamp, latest.timestamp) < 0 ? a : latest
            );
            setLatestArrival(newest);
          }
        }

        // Spread into a new array: the mock fetchAlerts() resolves with the
        // same mutable array reference every call, and setState bails out
        // on reference equality — without this, a genuinely new fetch
        // result would silently fail to re-render if the source array
        // happened to be the same object as last time.
        setAlerts([...data]);
        setStatus('success');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load SOS alerts.');
        setStatus('error');
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const clearArrival = useCallback(() => setLatestArrival(null), []);

  return { alerts, status, error, latestArrival, clearArrival };
}

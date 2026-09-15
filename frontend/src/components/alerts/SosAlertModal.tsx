import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { useClusters } from '@/hooks/useClusters';
import { RiskBadge } from '@/components/risk/RiskBadge';
import { CloseIcon, BellIcon } from '@/components/dashboard/icons';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import type { SosAlert } from '@/types/alert';
import type { ThermalCluster } from '@/types/cluster';
import { compareTimestampsDesc } from '@/lib/utils';

// The emergency incident queue: every SOS alert, newest first, each card
// showing just enough to triage (risk, persistence, severity, cluster,
// location) before sending the person to /map for the real investigation.
// Rendered once at the app root (App.tsx) so it works identically from
// /dash, /map, /history, or anywhere else — controlled entirely through
// NotificationCenterContext, not page-local state.
export function SosAlertModal() {
  const { isSosModalOpen, closeSosModal, alerts, alertsStatus, alertsError } = useNotificationCenter();
  const { clusters } = useClusters();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSosModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSosModal();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSosModalOpen, closeSosModal]);

  // Newest arrival first — the raw fetch order isn't guaranteed to match
  // timestamp order, so this is sorted explicitly rather than trusted as-is.
  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => compareTimestampsDesc(a.timestamp, b.timestamp)),
    [alerts]
  );

  if (!isSosModalOpen) return null;

  function goToCluster(clusterId: string) {
    closeSosModal();
    navigate(`/map?cluster=${clusterId}`);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8"
      onClick={closeSosModal}
    >
      <div
        className="flex w-full max-w-xl flex-col rounded-xl border border-base-700 bg-base-900 shadow-2xl"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="SOS alert queue"
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-base-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-thermal" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-100">SOS Alert Queue</span>
          </div>
          <button
            type="button"
            onClick={closeSosModal}
            aria-label="Close"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-base-600 text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-100"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {alertsStatus === 'loading' && <LoadingState label="Loading SOS alerts" />}
          {alertsStatus === 'error' && <ErrorState message={alertsError ?? 'Unable to reach the alerts API.'} />}
          {alertsStatus === 'success' && sortedAlerts.length === 0 && (
            <EmptyState title="No SOS alerts" description="There are currently no SOS alerts on record." />
          )}
          {alertsStatus === 'success' && sortedAlerts.length > 0 && (
            <div className="flex flex-col gap-3">
              {sortedAlerts.map((alert) => (
                <SosQueueCard
                  key={alert.alert_id}
                  alert={alert}
                  cluster={clusters.find((c) => c.cluster_id === alert.cluster_id) ?? null}
                  onTakeToMap={() => goToCluster(alert.cluster_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SosQueueCard({
  alert,
  cluster,
  onTakeToMap,
}: {
  alert: SosAlert;
  cluster: ThermalCluster | null;
  onTakeToMap: () => void;
}) {
  return (
    <div className="rounded-xl border border-base-700 bg-base-950 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <Metric label="Risk score" value={cluster?.risk_score ?? null} />
        <Metric label="Persistence" value={cluster?.persistence_score ?? null} align="right" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <RiskBadge level={alert.severity} />
        <span className="font-mono text-xs font-bold text-ink-100">Cluster {alert.cluster_id}</span>
      </div>
      <div className="mt-0.5 truncate text-xs text-ink-400">{alert.location}</div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onTakeToMap}
          className="flex items-center gap-1.5 rounded-lg border border-thermal/50 bg-thermal/10 px-3 py-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-thermal transition-colors hover:bg-thermal/20"
        >
          Take to Monitoring Map &rarr;
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, align = 'left' }: { label: string; value: number | null; align?: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className="font-mono text-lg font-bold text-ink-100">
        {value == null ? '—' : value}
        {value != null && <span className="text-2xs font-normal text-ink-500">/100</span>}
      </div>
    </div>
  );
}

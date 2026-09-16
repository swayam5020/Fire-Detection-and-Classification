import { useMemo, useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useClusters } from '@/hooks/useClusters';
import { AlertsSummaryBar } from '@/components/alerts/AlertsSummaryBar';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AlertDetailPanel } from '@/components/alerts/AlertDetailPanel';
import { AnomalyHistoryChart } from '@/components/alerts/AnomalyHistoryChart';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import type { SosAlert } from '@/types/alert';

// Historical anomaly/SOS record archive — this is the old /alert table,
// relocated here since /alert is now the single latest-anomaly view.
export function HistoryPage() {
  // clusters is fetched only so each alert's cluster_id can be resolved to
  // the same id ThermalCluster uses — see alertsAdapters.toSosAlert. This
  // page never renders cluster data itself.
  const { clusters } = useClusters();
  const { alerts, status, error, refetch } = useAlerts(clusters);
  const [severityFilter, setSeverityFilter] = useState<SosAlert['severity'] | 'all'>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'all') return alerts;
    return alerts.filter((a) => a.severity === severityFilter);
  }, [alerts, severityFilter]);

  const defaultSelectedId = useMemo(() => {
    const active = alerts.find((a) => a.status === 'active' && a.severity === 'critical');
    return active?.alert_id ?? alerts[0]?.alert_id ?? null;
  }, [alerts]);

  const selectedAlert = useMemo(
    () => alerts.find((a) => a.alert_id === (selectedAlertId ?? defaultSelectedId)) ?? null,
    [alerts, selectedAlertId, defaultSelectedId]
  );

  return (
    <div className="flex h-full overflow-hidden bg-base-950">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-2.5">
        {status === 'success' && (
          <AlertsSummaryBar alerts={alerts} severityFilter={severityFilter} onSeverityChange={setSeverityFilter} />
        )}

        <div className="flex-shrink-0 overflow-auto rounded-lg border border-base-700 bg-base-900">
          {status === 'loading' && <LoadingState label="Syncing historical records" />}
          {status === 'error' && <ErrorState message={error ?? 'Unable to reach the alerts API.'} onRetry={refetch} />}
          {status === 'success' && filteredAlerts.length === 0 && (
            <EmptyState
              title="No records match this filter"
              description="Try a different severity level."
              action={{ label: 'Show all severities', onClick: () => setSeverityFilter('all') }}
            />
          )}
          {status === 'success' && filteredAlerts.length > 0 && (
            <AlertsTable
              alerts={filteredAlerts}
              selectedAlertId={selectedAlert?.alert_id ?? null}
              onSelect={setSelectedAlertId}
            />
          )}
        </div>

        {status === 'success' && filteredAlerts.length > 0 && <AnomalyHistoryChart alerts={filteredAlerts} />}
      </div>

      {status === 'success' && selectedAlert && (
        <div className="w-[330px] flex-shrink-0 border-l border-base-700">
          <AlertDetailPanel alert={selectedAlert} />
        </div>
      )}
    </div>
  );
}

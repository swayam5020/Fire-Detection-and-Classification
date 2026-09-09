import { useMemo, useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertsSummaryBar } from '@/components/alerts/AlertsSummaryBar';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AlertDetailPanel } from '@/components/alerts/AlertDetailPanel';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import type { SosAlert } from '@/types/alert';

// Historical anomaly/SOS record archive — this is the old /alert table,
// relocated here since /alert is now the single latest-anomaly view.
export function HistoryPage() {
  const { alerts, status, error, refetch } = useAlerts();
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
    <div className="flex h-full flex-col overflow-hidden">
      {status === 'success' && (
        <AlertsSummaryBar alerts={alerts} severityFilter={severityFilter} onSeverityChange={setSeverityFilter} />
      )}

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto">
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

        {status === 'success' && selectedAlert && (
          <div className="w-[340px] flex-shrink-0">
            <AlertDetailPanel alert={selectedAlert} />
          </div>
        )}
      </div>
    </div>
  );
}

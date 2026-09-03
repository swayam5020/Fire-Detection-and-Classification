import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@/hooks/useAlerts';
import { useClusters } from '@/hooks/useClusters';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { RiskHighlightCard } from '@/components/risk/RiskHighlightCard';
import { PersistenceHighlightCard } from '@/components/risk/PersistenceHighlightCard';
import { Section, Row } from '@/components/shared/InfoBlock';
import { selectLatestAlert } from '@/lib/clusterSelection';
import { coordString, formatUtcTime, cn } from '@/lib/utils';

const SEVERITY_TEXT: Record<string, string> = {
  critical: 'text-risk-critical',
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};

// Focused, urgent single-anomaly view — the most recent thermal anomaly
// requiring attention, not the historical SOS table (that lives at
// /history now). Visual hierarchy matches /map's detail panel: Risk Score
// -> Risk Level -> Risk Reasons -> Persistence up top, secondary
// telemetry below.
export function AlertsPage() {
  const navigate = useNavigate();
  const { alerts, status: alertStatus, error: alertError, refetch: refetchAlerts } = useAlerts();
  const { clusters, status: clusterStatus } = useClusters();

  const latestAlert = useMemo(() => selectLatestAlert(alerts), [alerts]);
  const cluster = useMemo(
    () => (latestAlert ? clusters.find((c) => c.cluster_id === latestAlert.cluster_id) ?? null : null),
    [clusters, latestAlert]
  );

  const isLoading = alertStatus === 'loading' || clusterStatus === 'loading';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingState label="Checking latest anomaly" />
      </div>
    );
  }

  if (alertStatus === 'error') {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState message={alertError ?? 'Unable to reach the alerts API.'} onRetry={refetchAlerts} />
      </div>
    );
  }

  if (!latestAlert) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="No active anomalies"
          description="There is currently no thermal anomaly requiring immediate attention."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between border-b border-base-700 pb-4">
        <div>
          <span className={cn('font-mono text-xs font-bold uppercase tracking-wider', SEVERITY_TEXT[latestAlert.severity])}>
            {latestAlert.severity} &middot; {latestAlert.status}
          </span>
          <div className="mt-1 font-mono text-lg font-bold text-ink-100">Incident {latestAlert.alert_id}</div>
          <div className="mt-0.5 text-2xs text-ink-500">Cluster {latestAlert.cluster_id} &middot; {latestAlert.location}</div>
        </div>
        <span className="font-mono text-2xs text-ink-500">{formatUtcTime(latestAlert.timestamp)}</span>
      </div>

      <p className="text-sm leading-relaxed text-ink-300">{latestAlert.reason}</p>

      {cluster && (
        <>
          <RiskHighlightCard cluster={cluster} />
          <PersistenceHighlightCard persistenceScore={cluster.persistence_score} durationHours={cluster.duration_hours} />

          <div className="grid grid-cols-2 gap-3">
            <Metric label="FRP" value={`${cluster.frp.toFixed(1)} MW`} />
            <Metric label="Brightness" value={`${cluster.brightness.toFixed(1)} K`} />
          </div>

          <Section title="AI classification">
            <span className="text-sm font-semibold text-ink-100">{cluster.classification_label}</span>
          </Section>

          <Section title="Geographic location">
            <Row label="Coordinates" value={coordString(cluster.centroid.lat, cluster.centroid.lon)} />
            <Row label="Region" value={cluster.region} />
          </Section>

          <Section title="Adjacent infrastructure">
            {cluster.facility ? (
              <>
                <div className="mb-1 text-xs font-semibold text-ink-100">{cluster.facility.name}</div>
                <Row label="Facility type" value={cluster.facility.facility_type} />
                <Row label="Est. proximity" value={`${cluster.facility.distance_km.toFixed(1)}km radial`} emphasize />
              </>
            ) : (
              <div className="text-2xs text-ink-500">No adjacent infrastructure identified within risk radius.</div>
            )}
          </Section>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate(`/map?cluster=${latestAlert.cluster_id}`)}
        className="mt-2 flex items-center justify-center gap-2 rounded-sm border border-thermal/50 bg-thermal/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-thermal transition-colors hover:bg-thermal/20"
      >
        View on map &rarr;
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-base-700 bg-base-900 px-3 py-2">
      <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-bold text-ink-100">{value}</div>
    </div>
  );
}

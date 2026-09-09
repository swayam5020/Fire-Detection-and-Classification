import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClusters } from '@/hooks/useClusters';
import { useAlerts } from '@/hooks/useAlerts';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { CurrentSituationBanner } from '@/components/dashboard/CurrentSituationBanner';
import { SystemClockCard } from '@/components/dashboard/SystemClockCard';
import { SosAlertCard } from '@/components/dashboard/SosAlertCard';
import { RiskOverview } from '@/components/dashboard/RiskOverview';
import { PersistenceSummary } from '@/components/dashboard/PersistenceSummary';
import { PriorityEvents } from '@/components/dashboard/PriorityEvents';
import { ClassificationCard } from '@/components/dashboard/ClassificationCard';
import { LatestDetection } from '@/components/dashboard/LatestDetection';
import { MapPreviewCard } from '@/components/dashboard/MapPreviewCard';
import { OpenMapWidget } from '@/components/dashboard/OpenMapWidget';
import { SUPPORTED_DASHBOARD_CLASSIFICATIONS, dashboardClassificationLabel } from '@/lib/classification';
import { getActiveClusterIds } from '@/lib/clusterSelection';

// Operational command-center overview. Every number here is derived from
// the same mock/API cluster + alert data /map and /alert use — nothing is
// invented or hardcoded per-component.
export function DashboardPage() {
  const { clusters, status: clusterStatus, error: clusterError, refetch: refetchClusters } = useClusters();
  const { alerts, status: alertStatus } = useAlerts();
  const navigate = useNavigate();

  const activeClusterIds = useMemo(() => getActiveClusterIds(alerts), [alerts]);
  const activeClusters = useMemo(
    () => clusters.filter((c) => activeClusterIds.has(c.cluster_id)),
    [clusters, activeClusterIds]
  );

  // Active counts for the (currently) three supported classifications —
  // same derivation the /map classification-click selection uses.
  const classificationCounts = useMemo(() => {
    const byClass = new Map<string, { total: number; active: number }>();
    for (const cls of SUPPORTED_DASHBOARD_CLASSIFICATIONS) byClass.set(cls, { total: 0, active: 0 });
    for (const cluster of clusters) {
      const entry = byClass.get(cluster.classification);
      if (!entry) continue;
      entry.total += 1;
      if (activeClusterIds.has(cluster.cluster_id)) entry.active += 1;
    }
    return byClass;
  }, [clusters, activeClusterIds]);

  const latestCluster = useMemo(
    () => [...clusters].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] ?? null,
    [clusters]
  );

  const goToCluster = (clusterId: string) => navigate(`/map?cluster=${clusterId}`);

  const isLoading = clusterStatus === 'loading' || alertStatus === 'loading';
  const hasError = clusterStatus === 'error';

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6">
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <LoadingState label="Loading command center" />
        </div>
      )}

      {hasError && (
        <div className="flex h-full items-center justify-center">
          <ErrorState message={clusterError ?? 'Unable to reach the intelligence API.'} onRetry={refetchClusters} />
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <CurrentSituationBanner activeClusters={activeClusters} />
            </div>
            <div className="lg:col-span-3">
              <SystemClockCard />
            </div>
            <div className="lg:col-span-4">
              <SosAlertCard activeClusters={activeClusters} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <RiskOverview activeClusters={activeClusters} />
            <PersistenceSummary activeClusters={activeClusters} />

            <div className="flex h-full flex-col rounded-sm border border-base-700 bg-base-900 px-5 py-4">
              <div className="mb-3 font-mono text-2xs uppercase tracking-wider text-ink-500">
                Fire &amp; thermal classification
              </div>
              <div className="grid flex-1 grid-cols-3 items-center gap-2">
                {SUPPORTED_DASHBOARD_CLASSIFICATIONS.map((cls) => {
                  const entry = classificationCounts.get(cls) ?? { total: 0, active: 0 };
                  return (
                    <ClassificationCard
                      key={cls}
                      classification={cls}
                      label={dashboardClassificationLabel(cls)}
                      totalCount={entry.total}
                      activeCount={entry.active}
                      onClick={() => navigate(`/map?classification=${cls}`)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <PriorityEvents activeClusters={activeClusters} onSelectCluster={goToCluster} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <LatestDetection clusters={clusters} onSelectCluster={goToCluster} />
            </div>
            <div className="lg:col-span-7">
              <MapPreviewCard cluster={latestCluster} />
            </div>
          </div>

          <OpenMapWidget />

          <div className="pb-2 pt-1 text-2xs text-ink-500">
            All times in UTC &middot; Data updates in real-time &middot; Secure Connection Active
          </div>
        </div>
      )}
    </div>
  );
}

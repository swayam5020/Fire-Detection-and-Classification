import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClusters } from '@/hooks/useClusters';
import { useAlerts } from '@/hooks/useAlerts';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { CurrentSituationBanner } from '@/components/dashboard/CurrentSituationBanner';
import { SystemClockCard } from '@/components/dashboard/SystemClockCard';
import { SosAlertCard } from '@/components/dashboard/SosAlertCard';
import { ActiveCasesOverview } from '@/components/dashboard/ActiveCasesOverview';
import { LatestDetection } from '@/components/dashboard/LatestDetection';
import { HighestRiskDetection } from '@/components/dashboard/HighestRiskDetection';
import { MapPreviewCard } from '@/components/dashboard/MapPreviewCard';
import { OpenMapWidget } from '@/components/dashboard/OpenMapWidget';
import { RiskDistributionSection } from '@/components/dashboard/RiskDistributionSection';
import { SignalIcon, FlameIcon } from '@/components/dashboard/icons';
import { SUPPORTED_DASHBOARD_CLASSIFICATIONS } from '@/lib/classification';
import { getActiveClusterIds, selectHighestRiskCluster } from '@/lib/clusterSelection';
import type { ClassificationType } from '@/types/cluster';

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
    const byClass = new Map<ClassificationType, { total: number; active: number }>();
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
  const highestRiskCluster = useMemo(
    () => selectHighestRiskCluster(clusters, { activeClusterIds }),
    [clusters, activeClusterIds]
  );

  const goToCluster = (clusterId: string) => navigate(`/map?cluster=${clusterId}`);

  const isLoading = clusterStatus === 'loading' || alertStatus === 'loading';
  const hasError = clusterStatus === 'error';

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-base-950 px-6 py-6">
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
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
          {/* Row 1 — current situation, system clock, SOS alerts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <CurrentSituationBanner activeClusters={activeClusters} />
            <SystemClockCard />
            <SosAlertCard activeClusters={activeClusters} />
          </div>

          {/* Row 2 — active case count + classification breakdown */}
          <ActiveCasesOverview
            activeCount={activeClusters.length}
            classificationCounts={classificationCounts}
            onSelectClassification={(cls) => navigate(`/map?classification=${cls}`)}
          />

          {/* Row 3 — latest vs. highest-risk detection */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LatestDetection clusters={clusters} onSelectCluster={goToCluster} />
            <HighestRiskDetection clusters={clusters} alerts={alerts} onSelectCluster={goToCluster} />
          </div>

          {/* Row 4 — map preview for each of the above, and the full-map entry point */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <MapPreviewCard
              title="Latest detection location"
              icon={SignalIcon}
              actionLabel="View Latest Detection"
              cluster={latestCluster}
            />
            <MapPreviewCard
              title="Highest risk location"
              icon={FlameIcon}
              actionLabel="View Highest-Risk Case"
              cluster={highestRiskCluster}
            />
          </div>

          {/* Row 5 — risk overview + circular risk distribution */}
          <RiskDistributionSection activeClusters={activeClusters} />

          <OpenMapWidget />

          <div className="pb-2 pt-1 text-2xs text-ink-500">
            All times in UTC &middot; Data updates in real-time &middot; Secure Connection Active
          </div>
        </div>
      )}
    </div>
  );
}

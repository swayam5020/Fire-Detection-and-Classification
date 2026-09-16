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
import { RiskOverviewCard } from '@/components/dashboard/RiskOverviewCard';
import { ClassificationDistributionCard } from '@/components/dashboard/ClassificationDistributionCard';
import { SUPPORTED_DASHBOARD_CLASSIFICATIONS } from '@/lib/classification';
import { getActiveClusterIds } from '@/lib/clusterSelection';
import type { ClassificationType } from '@/types/cluster';

// Operational command-center overview. Every number here is derived from
// the same mock/API cluster + alert data /map and /alert use — nothing is
// invented or hardcoded per-component.
export function DashboardPage() {
  const { clusters, status: clusterStatus, error: clusterError, refetch: refetchClusters } = useClusters();
  // clusters resolves each alert's cluster_id to match ThermalCluster's —
  // see alertsAdapters.toSosAlert.
  const { alerts, status: alertStatus } = useAlerts(clusters);
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

  const goToCluster = (clusterId: string) => navigate(`/map?cluster=${clusterId}`);

  const isLoading = clusterStatus === 'loading' || alertStatus === 'loading';
  const hasError = clusterStatus === 'error';

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-base-950 px-4 py-4">
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
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
          {/* Row 1 — current situation, system status, SOS alerts */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <CurrentSituationBanner activeClusters={activeClusters} />
            <SystemClockCard />
            <SosAlertCard activeClusters={activeClusters} />
          </div>

          {/* Row 2 — cases by classification */}
          <ActiveCasesOverview
            classificationCounts={classificationCounts}
            onSelectClassification={(cls) => navigate(`/map?classification=${cls}`)}
          />

          {/* Row 3 — latest & highest-risk detection, each with an inline map preview */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <LatestDetection clusters={clusters} onSelectCluster={goToCluster} />
            <HighestRiskDetection clusters={clusters} alerts={alerts} onSelectCluster={goToCluster} />
          </div>

          {/* Row 4 — risk overview donut + classification distribution */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <RiskOverviewCard activeClusters={activeClusters} />
            <ClassificationDistributionCard activeClusters={activeClusters} />
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClusters } from '@/hooks/useClusters';
import { useAlerts } from '@/hooks/useAlerts';
import { MapView } from '@/components/map/MapView';
import { MapControlPanel } from '@/components/map/MapControlPanel';
import { FilterBar } from '@/components/filters/FilterBar';
import { DetailPanel } from '@/components/detail/DetailPanel';
import { StatStrip } from '@/components/detail/StatStrip';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import type { ClusterFilters, ClassificationType, RiskLevel } from '@/types/cluster';
import { getActiveClusterIds, selectHighestRiskCluster } from '@/lib/clusterSelection';
import { isWithinDateRange, presetRangeBounds } from '@/lib/dateRange';

const ALL_RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

function baseFilters(): ClusterFilters {
  return { riskLevels: ALL_RISK_LEVELS, classifications: [], timeRange: '24h', customRange: null };
}

export function MapPage() {
  const { clusters, status, error, refetch } = useClusters();
  const { alerts } = useAlerts();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedClusterId = searchParams.get('cluster');
  const requestedClassification = searchParams.get('classification') as ClassificationType | null;

  const [filters, setFilters] = useState<ClusterFilters>(() => {
    const initial = baseFilters();
    if (requestedClassification) initial.classifications = [requestedClassification];
    return initial;
  });
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [hasResolvedInitialSelection, setHasResolvedInitialSelection] = useState(false);

  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      const riskMatch = filters.riskLevels.length === 0 || filters.riskLevels.includes(c.risk_level);
      const classMatch = filters.classifications.length === 0 || filters.classifications.includes(c.classification);

      const timeMatch = (() => {
        if (filters.timeRange === 'custom') {
          // No range chosen yet in the picker — don't filter until one is applied.
          if (!filters.customRange) return true;
          return isWithinDateRange(c.timestamp, filters.customRange);
        }
        const { startMs, endMs } = presetRangeBounds(filters.timeRange);
        const t = new Date(c.timestamp).getTime();
        return t >= startMs && t <= endMs;
      })();

      return riskMatch && classMatch && timeMatch;
    });
  }, [clusters, filters]);

  // Fallback default target: the highest-risk cluster overall, used once
  // any route-driven selection has been resolved (or if there was none).
  const defaultClusterId = useMemo(() => {
    return selectHighestRiskCluster(clusters)?.cluster_id ?? null;
  }, [clusters]);

  // Resolve the initial target once, when cluster (and alert) data has
  // loaded. An explicit ?cluster= from /alert wins outright; a
  // ?classification= from /dash resolves to that classification's
  // highest-risk active cluster via the shared selection helper; absent
  // either, fall back to the highest-risk cluster overall.
  useEffect(() => {
    if (hasResolvedInitialSelection || clusters.length === 0) return;

    if (requestedClusterId && clusters.some((c) => c.cluster_id === requestedClusterId)) {
      setSelectedClusterId(requestedClusterId);
      setHasResolvedInitialSelection(true);
      return;
    }

    if (requestedClassification) {
      const activeIds = getActiveClusterIds(alerts);
      const match = selectHighestRiskCluster(clusters, {
        classification: requestedClassification,
        activeClusterIds: activeIds,
      });
      if (match) {
        setSelectedClusterId(match.cluster_id);
        setHasResolvedInitialSelection(true);
        return;
      }
    }

    if (defaultClusterId) {
      setSelectedClusterId(defaultClusterId);
      setHasResolvedInitialSelection(true);
    }
  }, [hasResolvedInitialSelection, clusters, alerts, requestedClusterId, requestedClassification, defaultClusterId]);

  // Once the initial route-driven selection has been applied, strip the
  // query params so later interaction (picking other clusters, changing
  // filters) isn't fighting stale URL state.
  useEffect(() => {
    if (hasResolvedInitialSelection && (requestedClusterId || requestedClassification)) {
      setSearchParams({}, { replace: true });
    }
  }, [hasResolvedInitialSelection, requestedClusterId, requestedClassification, setSearchParams]);

  // If selection is ever cleared after the initial resolution, fall back
  // to the highest-risk cluster so the panel is never empty.
  useEffect(() => {
    if (hasResolvedInitialSelection && selectedClusterId === null && defaultClusterId) {
      setSelectedClusterId(defaultClusterId);
    }
  }, [hasResolvedInitialSelection, selectedClusterId, defaultClusterId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // The panel is a persistent fixture, not a dismissible overlay — Esc
      // returns focus to the default (highest-risk) target.
      if (e.key === 'Escape' && defaultClusterId) setSelectedClusterId(defaultClusterId);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [defaultClusterId]);

  const selectedCluster = useMemo(
    () => clusters.find((c) => c.cluster_id === selectedClusterId) ?? null,
    [clusters, selectedClusterId]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {status === 'success' && <FilterBar filters={filters} onChange={setFilters} clusters={clusters} />}

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-[3] flex-col">
          <div className="relative min-h-0 flex-1">
            {status === 'loading' && <LoadingState label="Establishing satellite feed" />}
            {status === 'error' && <ErrorState message={error ?? 'Unable to reach the intelligence API.'} onRetry={refetch} />}
            {status === 'success' && filteredClusters.length === 0 && (
              <EmptyState
                title="No anomalies match these filters"
                description="Try widening the risk level or infrastructure type filters."
                action={{ label: 'Reset filters', onClick: () => setFilters(baseFilters()) }}
              />
            )}
            {status === 'success' && filteredClusters.length > 0 && (
              <MapView
                clusters={filteredClusters}
                selectedClusterId={selectedClusterId}
                onSelectCluster={setSelectedClusterId}
              />
            )}
            {status === 'success' && (
              <MapControlPanel filters={filters} onChange={setFilters} clusters={clusters} />
            )}
          </div>
          {status === 'success' && <StatStrip clusters={filteredClusters} />}
        </div>

        <div className="min-w-[300px] max-w-[380px] flex-1 flex-shrink-0">
          {status === 'success' && selectedCluster ? (
            <DetailPanel
              cluster={selectedCluster}
              onClose={() => defaultClusterId && setSelectedClusterId(defaultClusterId)}
            />
          ) : (
            <aside className="flex h-full w-full flex-col items-center justify-center gap-2 border-l border-base-700 bg-base-950 px-4 text-center">
              <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">
                {status === 'loading' ? 'Awaiting target data' : 'No target selected'}
              </span>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

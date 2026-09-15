import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClusters } from '@/hooks/useClusters';
import { useAlerts } from '@/hooks/useAlerts';
import { compareByRiskScoreDesc, getActiveClusterIds } from '@/lib/clusterSelection';
import { CLASSIFICATION_LABELS } from '@/lib/classification';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ActiveCaseCard } from '@/components/active/ActiveCaseCard';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { FlameIcon } from '@/components/dashboard/icons';
import { cn } from '@/lib/utils';
import type { ClassificationType, RiskLevel, ThermalCluster } from '@/types/cluster';

const RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

// Operational priority: critical first, then by score within a level.
const RISK_ORDER: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const LEVEL_VALUE_CLASS: Record<RiskLevel, string> = {
  critical: 'text-risk-critical',
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};

type RiskFilter = RiskLevel | 'all';
type ClassFilter = ClassificationType | 'all';

/**
 * Currently-active thermal cases only. "Active" is not a field on a cluster —
 * it is derived from whether the cluster has a live SOS alert, using the same
 * getActiveClusterIds helper /dash and /map already share, so this page can
 * never disagree with them about what is active.
 *
 * /history shows the full record including resolved cases; this page is the
 * live working set.
 */
export function ActiveCasesPage() {
  const { clusters, status: clusterStatus, error: clusterError, refetch } = useClusters();
  const { alerts, status: alertStatus } = useAlerts();
  const navigate = useNavigate();

  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [search, setSearch] = useState('');

  const activeCases = useMemo(() => {
    const activeIds = getActiveClusterIds(alerts);
    return clusters
      .filter((c) => activeIds.has(c.cluster_id))
      .sort((a, b) => RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level] || compareByRiskScoreDesc(a, b));
  }, [clusters, alerts]);

  const countsByLevel = useMemo(() => {
    const counts: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const c of activeCases) counts[c.risk_level] += 1;
    return counts;
  }, [activeCases]);

  // Only offer classifications that actually occur among active cases.
  const availableClassifications = useMemo(
    () => Array.from(new Set(activeCases.map((c) => c.classification))),
    [activeCases]
  );

  const visibleCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeCases.filter((c) => {
      if (riskFilter !== 'all' && c.risk_level !== riskFilter) return false;
      if (classFilter !== 'all' && c.classification !== classFilter) return false;
      // `?? ''` rather than interpolating a null, which would make every
      // region-less case match a search for "null".
      if (query && !`${c.cluster_id} ${c.region ?? ''}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [activeCases, riskFilter, classFilter, search]);

  const resetFilters = () => {
    setRiskFilter('all');
    setClassFilter('all');
    setSearch('');
  };

  const isLoading = clusterStatus === 'loading' || alertStatus === 'loading';
  const hasError = clusterStatus === 'error';

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-base-950 px-4 py-4">
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <LoadingState label="Loading active cases" />
        </div>
      )}

      {hasError && (
        <div className="flex h-full items-center justify-center">
          <ErrorState message={clusterError ?? 'Unable to reach the intelligence API.'} onRetry={refetch} />
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <SectionHeader
              label="Active cases"
              icon={FlameIcon}
              labelClassName="text-[13px] tracking-[0.1em]"
              className="py-2"
              right={
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white/85">
                  {activeCases.length} active
                </span>
              }
            />
            <p className="text-[12px] leading-snug text-ink-300">
              Currently active thermal anomaly cases requiring monitoring.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-base-700 bg-base-700 sm:grid-cols-5">
            <SummaryTile label="Active cases" value={activeCases.length} />
            <SummaryTile label="Critical" value={countsByLevel.critical} valueClass={LEVEL_VALUE_CLASS.critical} />
            <SummaryTile label="High risk" value={countsByLevel.high} valueClass={LEVEL_VALUE_CLASS.high} />
            <SummaryTile label="Medium" value={countsByLevel.medium} valueClass={LEVEL_VALUE_CLASS.medium} />
            <SummaryTile label="Low" value={countsByLevel.low} valueClass={LEVEL_VALUE_CLASS.low} />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 rounded-lg border border-base-700 bg-base-900 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-400">Risk level</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <FilterPill active={riskFilter === 'all'} onClick={() => setRiskFilter('all')}>
                  All ({activeCases.length})
                </FilterPill>
                {RISK_LEVELS.map((level) => (
                  <FilterPill key={level} active={riskFilter === level} onClick={() => setRiskFilter(level)}>
                    {level} ({countsByLevel[level]})
                  </FilterPill>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-400">Type</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value as ClassFilter)}
                className="rounded-md border border-base-700 bg-base-950 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-accent-dark outline-none transition-colors focus:border-accent"
              >
                <option value="all">All classifications</option>
                {availableClassifications.map((cls) => (
                  <option key={cls} value={cls}>
                    {CLASSIFICATION_LABELS[cls]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-1 items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-400">Search</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Case ID or location"
                aria-label="Search active cases by case ID or location"
                className="min-w-[160px] flex-1 rounded-md border border-base-700 bg-base-950 px-2.5 py-1.5 font-mono text-[11px] text-ink-100 outline-none transition-colors placeholder:text-ink-500 focus:border-accent"
              />
            </div>
          </div>

          {activeCases.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-base-700 bg-base-900">
              <EmptyState
                title="No active thermal cases"
                description="Nothing is currently active. Resolved and acknowledged records remain available in Historical Logs."
              />
            </div>
          ) : visibleCases.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-base-700 bg-base-900">
              <EmptyState
                title="No cases match these filters"
                description="Try a different risk level, classification, or search term."
                action={{ label: 'Reset filters', onClick: resetFilters }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCases.map((cluster: ThermalCluster) => (
                <ActiveCaseCard
                  key={cluster.cluster_id}
                  cluster={cluster}
                  onViewOnMap={(clusterId) => navigate(`/map?cluster=${clusterId}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, valueClass }: { label: string; value: number; valueClass?: string }) {
  return (
    <div className="bg-base-900 px-4 py-3">
      <div className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">{label}</div>
      <div className={cn('mt-2 font-mono text-[26px] font-bold leading-none', valueClass ?? 'text-ink-100')}>
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.06em] transition-colors',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-base-700 text-ink-300 hover:border-ink-400 hover:text-ink-100'
      )}
    >
      {children}
    </button>
  );
}

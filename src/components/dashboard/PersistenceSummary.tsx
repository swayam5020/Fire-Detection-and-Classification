import type { ThermalCluster } from '@/types/cluster';

interface PersistenceSummaryProps {
  activeClusters: ThermalCluster[];
}

// A source is treated as "persistent" once its persistence score crosses
// this threshold — the same distinction the risk engine's persistence
// scoring is meant to convey (sustained industrial activity vs. a
// transient fire), just summarized at a glance here.
const PERSISTENT_THRESHOLD = 60;

export function PersistenceSummary({ activeClusters }: PersistenceSummaryProps) {
  const persistentCount = activeClusters.filter((c) => c.persistence_score >= PERSISTENT_THRESHOLD).length;
  const avgScore =
    activeClusters.length === 0
      ? 0
      : Math.round(activeClusters.reduce((sum, c) => sum + c.persistence_score, 0) / activeClusters.length);

  return (
    <div className="flex h-full flex-col rounded-sm border border-base-700 bg-base-900 px-5 py-4">
      <div className="mb-3 font-mono text-2xs uppercase tracking-wider text-ink-500">Persistence summary</div>
      <div className="flex flex-1 items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Persistent Sources</div>
          <div className="mt-1 font-mono text-3xl font-bold text-ink-100">{persistentCount}</div>
          <div className="text-2xs text-ink-500">/ {activeClusters.length} active</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Avg. Persistence Score</div>
          <div className="mt-1 font-mono text-3xl font-bold text-ink-100">{avgScore}</div>
          <div className="text-2xs text-ink-500">/100</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-700">
        <div className="h-full rounded-full bg-thermal/70 transition-all" style={{ width: `${avgScore}%` }} />
      </div>
    </div>
  );
}

import type { ThermalCluster, RiskLevel } from '@/types/cluster';
import { riskDotColor } from '@/components/risk/RiskBadge';

interface RiskOverviewProps {
  activeClusters: ThermalCluster[];
}

const LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

export function RiskOverview({ activeClusters }: RiskOverviewProps) {
  const total = activeClusters.length;
  const counts = LEVELS.map((level) => ({
    level,
    count: activeClusters.filter((c) => c.risk_level === level).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="flex h-full flex-col rounded-sm border border-base-700 bg-base-900 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Risk overview</span>
        <span className="font-mono text-2xs text-ink-500">{total} active</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {counts.map(({ level, count }) => (
          <div key={level} className="flex items-center gap-3">
            <span className="block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: riskDotColor(level) }} />
            <span className="w-16 flex-shrink-0 font-mono text-2xs font-semibold uppercase tracking-wider text-ink-300">
              {level}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-700">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: riskDotColor(level) }}
              />
            </div>
            <span className="w-6 flex-shrink-0 text-right font-mono text-xs font-bold text-ink-100">{count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-base-700 pt-3">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Total Active Anomalies</span>
        <span className="font-mono text-sm font-bold text-ink-100">{total}</span>
      </div>
    </div>
  );
}

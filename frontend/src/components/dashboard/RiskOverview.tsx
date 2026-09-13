import type { ThermalCluster, RiskLevel } from '@/types/cluster';
import { riskDotColor } from '@/components/risk/RiskBadge';

interface RiskOverviewProps {
  activeClusters: ThermalCluster[];
}

const LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

// Bars-only content — the outer card, "Total Active Cases" figure, and
// circular breakdown live in RiskDistributionSection, which composes this
// alongside RiskDistributionDonut from the same active-cluster data.
export function RiskOverview({ activeClusters }: RiskOverviewProps) {
  const counts = LEVELS.map((level) => ({
    level,
    count: activeClusters.filter((c) => c.risk_level === level).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="flex flex-col justify-center gap-3">
      {counts.map(({ level, count }) => (
        <div key={level} className="flex items-center gap-3">
          <span className="w-16 flex-shrink-0 font-mono text-2xs font-semibold uppercase tracking-wider text-ink-300">
            {level}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-base-700">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(count / max) * 100}%`, backgroundColor: riskDotColor(level) }}
            />
          </div>
          <span className="w-6 flex-shrink-0 text-right font-mono text-sm font-bold text-ink-100">{count}</span>
        </div>
      ))}
    </div>
  );
}

import type { ThermalCluster, RiskLevel } from '@/types/cluster';
import { riskDotColor } from './RiskBadge';

interface RiskDistributionDonutProps {
  activeClusters: ThermalCluster[];
}

const LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
const LEVEL_LABEL: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const SIZE = 120;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Donut segments and the legend both read from the same active-cluster
// counts that drive RiskOverview's bars — never a separate computation.
export function RiskDistributionDonut({ activeClusters }: RiskDistributionDonutProps) {
  const total = activeClusters.length;
  const counts = LEVELS.map((level) => ({
    level,
    count: activeClusters.filter((c) => c.risk_level === level).length,
  }));

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#2a2f36" strokeWidth={STROKE} />
          {total > 0 &&
            counts.map(({ level, count }) => {
              if (count === 0) return null;
              const segmentLength = (count / total) * CIRCUMFERENCE;
              const dashArray = `${segmentLength} ${CIRCUMFERENCE - segmentLength}`;
              const dashOffset = -cumulative;
              cumulative += segmentLength;
              return (
                <circle
                  key={level}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={riskDotColor(level)}
                  strokeWidth={STROKE}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-ink-100">{total}</span>
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">active</span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 sm:ml-4">
        {counts.map(({ level, count }) => (
          <li key={level} className="flex items-center gap-2 font-mono text-xs">
            <span className="block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: riskDotColor(level) }} />
            <span className="w-16 text-ink-300">{LEVEL_LABEL[level]}</span>
            <span className="w-6 text-right font-bold text-ink-100">{count}</span>
            <span className="w-10 text-right text-ink-500">{total === 0 ? '0%' : `${Math.round((count / total) * 100)}%`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

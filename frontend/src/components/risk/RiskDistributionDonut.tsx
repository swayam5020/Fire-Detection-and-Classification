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

const SIZE = 112;
const STROKE = 18;
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
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#D8CFB8" strokeWidth={STROKE} />
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5">
          <span className="font-mono text-[28px] font-bold leading-none text-ink-100">{total}</span>
          <span className="mt-1 text-center font-mono text-[9px] font-bold uppercase leading-[1.3] tracking-[0.05em] text-ink-400">
            Total active cases
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 sm:ml-4">
        {counts.map(({ level, count }) => (
          <li key={level} className="flex items-center gap-2 font-mono text-[13px]">
            <span className="block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: riskDotColor(level) }} />
            <span className="w-20 text-ink-300">{LEVEL_LABEL[level]}</span>
            <span className="w-6 text-right font-bold text-ink-100">{count}</span>
            <span className="w-11 text-right text-ink-400">{total === 0 ? '0%' : `${Math.round((count / total) * 100)}%`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { ThermalCluster, RiskLevel } from '@/types/cluster';
import { RiskBadge } from './RiskBadge';
import { RiskBar } from './RiskBar';

interface RiskHighlightCardProps {
  cluster: ThermalCluster;
}

const LEVEL_ACCENT_BORDER: Record<RiskLevel, string> = {
  critical: 'border-l-risk-critical',
  high: 'border-l-risk-high',
  medium: 'border-l-risk-medium',
  low: 'border-l-risk-low',
};

export function RiskHighlightCard({ cluster }: RiskHighlightCardProps) {
  return (
    <div
      className={`rounded-sm border-y border-r border-base-700 border-l-4 bg-base-900 px-4 py-3 ${LEVEL_ACCENT_BORDER[cluster.risk_level]}`}
    >
      <div className="mb-1.5 font-mono text-2xs uppercase tracking-wider text-ink-500">Risk</div>

      <div className="mb-2 flex items-end justify-between gap-3">
        <span className="font-mono text-4xl font-bold leading-none text-ink-100">
          {cluster.risk_score}
          <span className="text-sm font-normal text-ink-500"> / 100</span>
        </span>
        <RiskBadge level={cluster.risk_level} size="lg" />
      </div>

      <RiskBar score={cluster.risk_score} level={cluster.risk_level} />

      <ul className="mt-3 space-y-1.5">
        {cluster.risk_reasons.map((reason) => (
          <li key={reason} className="flex gap-1.5 text-xs text-ink-200">
            <span className="text-ink-500">&bull;</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

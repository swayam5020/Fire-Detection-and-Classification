import type { ThermalCluster, RiskLevel } from '@/types/cluster';
import { RiskBadge } from './RiskBadge';
import { RiskBar } from './RiskBar';

interface RiskHighlightCardProps {
  cluster: ThermalCluster;
}

// The card is outlined in the level's own colour with a heavier left edge,
// the way the reference marks a live target.
const LEVEL_ACCENT_BORDER: Record<RiskLevel, string> = {
  critical: 'border-risk-critical/40 border-l-risk-critical',
  high: 'border-risk-high/40 border-l-risk-high',
  medium: 'border-risk-medium/40 border-l-risk-medium',
  low: 'border-risk-low/40 border-l-risk-low',
};

export function RiskHighlightCard({ cluster }: RiskHighlightCardProps) {
  return (
    <div className={`rounded-lg border border-l-4 bg-base-900 px-3.5 py-3 ${LEVEL_ACCENT_BORDER[cluster.risk_level]}`}>
      <div className="mb-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">Risk</div>

      <div className="mb-2.5 flex items-end justify-between gap-3">
        <span className="font-mono text-[38px] font-bold leading-none text-ink-100">
          {cluster.risk_score}
          <span className="font-mono text-[13px] font-normal text-ink-400"> / 100</span>
        </span>
        <RiskBadge level={cluster.risk_level} size="lg" tone="solid" />
      </div>

      <RiskBar score={cluster.risk_score} level={cluster.risk_level} />

      <ul className="mt-3 space-y-1.5">
        {cluster.risk_reasons.map((reason) => (
          <li key={reason} className="flex gap-1.5 text-[11px] leading-snug text-ink-200">
            <span className="text-ink-400">&bull;</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

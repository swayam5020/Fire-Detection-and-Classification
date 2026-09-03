import type { ThermalCluster } from '@/types/cluster';
import { RiskBadge } from '@/components/risk/RiskBadge';

interface HoverCardProps {
  cluster: ThermalCluster;
}

export function HoverCard({ cluster }: HoverCardProps) {
  return (
    <div className="w-64 rounded-sm border border-base-600 bg-base-900 shadow-lg">
      <div className="flex items-center justify-between border-b border-base-700 px-3 py-2">
        <span className="font-mono text-xs font-semibold text-ink-100">Cluster: {cluster.cluster_id}</span>
        <RiskBadge level={cluster.risk_level} />
      </div>
      <div className="px-3 py-2">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Risk score</span>
          <span className="font-mono text-sm font-bold text-ink-100">
            {cluster.risk_score}
            <span className="text-2xs font-normal text-ink-500">/100</span>
          </span>
        </div>
        <ul className="space-y-0.5">
          {cluster.risk_reasons.slice(0, 3).map((reason) => (
            <li key={reason} className="flex gap-1.5 text-2xs text-ink-300">
              <span className="text-ink-500">&bull;</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

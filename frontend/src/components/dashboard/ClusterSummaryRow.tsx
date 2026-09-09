import type { ThermalCluster } from '@/types/cluster';
import { RiskBadge, RISK_TEXT_CLASS, riskDotColor } from '@/components/risk/RiskBadge';
import { dashboardClassificationLabel } from '@/lib/classification';
import { classificationIcon } from './icons';

interface ClusterSummaryRowProps {
  cluster: ThermalCluster;
  onClick: () => void;
}

export function ClusterSummaryRow({ cluster, onClick }: ClusterSummaryRowProps) {
  const Icon = classificationIcon(cluster.classification);
  const color = riskDotColor(cluster.risk_level);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-sm border border-base-700 bg-base-900 px-3 py-2.5 text-left transition-colors hover:border-ink-400 hover:bg-base-850"
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-ink-100">{cluster.cluster_id}</span>
          <RiskBadge level={cluster.risk_level} />
        </div>
        <span className="truncate text-2xs text-ink-400">
          {dashboardClassificationLabel(cluster.classification)} &middot; {cluster.region}
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-6">
        <div className={`w-20 text-right font-mono text-sm font-bold ${RISK_TEXT_CLASS[cluster.risk_level]}`}>
          {cluster.risk_score}
          <span className="text-2xs font-normal text-ink-500">/100</span>
        </div>
        <div className="w-20 text-right font-mono text-sm font-bold text-ink-100">
          {cluster.persistence_score}
          <span className="text-2xs font-normal text-ink-500">/100</span>
        </div>
      </div>
    </button>
  );
}

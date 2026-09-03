import type { ThermalCluster } from '@/types/cluster';
import { RiskBadge, RISK_TEXT_CLASS } from '@/components/risk/RiskBadge';
import { dashboardClassificationLabel } from '@/lib/classification';
import { formatRelativeShort } from '@/lib/utils';

interface LatestDetectionProps {
  clusters: ThermalCluster[];
  onSelectCluster: (clusterId: string) => void;
}

export function LatestDetection({ clusters, onSelectCluster }: LatestDetectionProps) {
  const latest = [...clusters].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  return (
    <div className="flex h-full flex-col rounded-sm border border-base-700 bg-base-900 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Latest detection</span>
        {latest && <span className="font-mono text-2xs text-ink-500">{formatRelativeShort(latest.timestamp)}</span>}
      </div>

      {!latest ? (
        <div className="rounded-sm border border-base-700 bg-base-950 px-4 py-3 text-2xs text-ink-500">
          No thermal detections available.
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelectCluster(latest.cluster_id)}
          className="flex flex-1 flex-col justify-center gap-4 rounded-sm text-left sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-ink-100">{latest.cluster_id}</span>
              <RiskBadge level={latest.risk_level} />
            </div>
            <div className="mt-0.5 truncate text-sm text-ink-400">
              {dashboardClassificationLabel(latest.classification)} &middot; {latest.region}
            </div>
          </div>

          <div className="flex flex-shrink-0 gap-3">
            <div className="rounded-sm border border-base-700 bg-base-950 px-3 py-2 text-center">
              <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Risk score</div>
              <div className={`mt-0.5 font-mono text-lg font-bold ${RISK_TEXT_CLASS[latest.risk_level]}`}>
                {latest.risk_score}
                <span className="text-2xs font-normal text-ink-500">/100</span>
              </div>
            </div>
            <div className="rounded-sm border border-base-700 bg-base-950 px-3 py-2 text-center">
              <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Persistence</div>
              <div className="mt-0.5 font-mono text-lg font-bold text-ink-100">
                {latest.persistence_score}
                <span className="text-2xs font-normal text-ink-500">/100</span>
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

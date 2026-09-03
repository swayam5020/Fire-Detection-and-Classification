import { useNavigate } from 'react-router-dom';
import type { ThermalCluster } from '@/types/cluster';
import { ClusterSummaryRow } from './ClusterSummaryRow';

interface PriorityEventsProps {
  activeClusters: ThermalCluster[];
  onSelectCluster: (clusterId: string) => void;
  limit?: number;
}

export function PriorityEvents({ activeClusters, onSelectCluster, limit = 4 }: PriorityEventsProps) {
  const navigate = useNavigate();
  const top = [...activeClusters].sort((a, b) => b.risk_score - a.risk_score).slice(0, limit);

  return (
    <div className="rounded-sm border border-base-700 bg-base-900 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Priority events</span>
        {top.length > 0 && (
          <div className="flex items-center gap-6 pr-12">
            <span className="w-20 flex-shrink-0 whitespace-nowrap text-right font-mono text-2xs uppercase tracking-wider text-ink-500">
              Risk score
            </span>
            <span className="w-20 flex-shrink-0 whitespace-nowrap text-right font-mono text-2xs uppercase tracking-wider text-ink-500">
              Persistence
            </span>
          </div>
        )}
      </div>

      {top.length === 0 ? (
        <div className="rounded-sm border border-base-700 bg-base-950 px-4 py-3 text-2xs text-ink-500">
          No active anomalies requiring priority attention.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {top.map((cluster) => (
            <ClusterSummaryRow
              key={cluster.cluster_id}
              cluster={cluster}
              onClick={() => onSelectCluster(cluster.cluster_id)}
            />
          ))}
        </div>
      )}

      {activeClusters.length > 0 && (
        <button
          type="button"
          onClick={() => navigate('/map')}
          className="mt-3 text-sm text-thermal transition-colors hover:text-thermal-bright hover:underline"
        >
          View all priority events &rarr;
        </button>
      )}
    </div>
  );
}

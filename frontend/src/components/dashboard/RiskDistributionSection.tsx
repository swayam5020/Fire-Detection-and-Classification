import type { ThermalCluster } from '@/types/cluster';
import { RiskOverview } from './RiskOverview';
import { RiskDistributionDonut } from '@/components/risk/RiskDistributionDonut';
import { StackIcon, BarChartIcon } from './icons';

interface RiskDistributionSectionProps {
  activeClusters: ThermalCluster[];
}

// Row 5: risk-level breakdown of active cases, shown two ways (bars +
// donut) from the exact same activeClusters array — no separate tallying.
export function RiskDistributionSection({ activeClusters }: RiskDistributionSectionProps) {
  const total = activeClusters.length;

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 px-6 py-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChartIcon className="h-4 w-4 text-ink-400" />
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">
            Risk overview &amp; classification distribution
          </span>
        </div>
        <span className="font-mono text-2xs text-ink-500">
          {total} total active case{total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[180px_minmax(0,1fr)_320px]">
        <div className="flex items-center gap-3 rounded-lg border border-base-700 bg-base-950 px-4 py-3 lg:flex-col lg:items-start lg:justify-center">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-base-600 text-ink-300">
            <StackIcon className="h-4 w-4" />
          </span>
          <div>
            <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Total active cases</div>
            <div className="font-mono text-2xl font-bold text-ink-100">{total}</div>
          </div>
        </div>

        <div className="flex items-center">
          <RiskOverview activeClusters={activeClusters} />
        </div>

        <div className="flex items-center justify-center border-t border-base-700 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <RiskDistributionDonut activeClusters={activeClusters} />
        </div>
      </div>
    </div>
  );
}

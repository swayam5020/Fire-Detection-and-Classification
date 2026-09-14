import type { ThermalCluster } from '@/types/cluster';
import { RiskDistributionDonut } from '@/components/risk/RiskDistributionDonut';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { BarChartIcon } from './icons';

interface RiskOverviewCardProps {
  activeClusters: ThermalCluster[];
}

// Row 5, left card: risk-level breakdown of active cases as a donut — the
// total-active figure now lives in its center rather than a separate box,
// matching the reference. Same activeClusters data as everywhere else.
export function RiskOverviewCard({ activeClusters }: RiskOverviewCardProps) {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader label="Risk overview" icon={BarChartIcon} />
      <div className="flex flex-1 items-center justify-center rounded-xl border border-base-700 bg-base-900 px-4 py-3">
        <RiskDistributionDonut activeClusters={activeClusters} />
      </div>
    </div>
  );
}

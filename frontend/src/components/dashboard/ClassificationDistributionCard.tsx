import type { ThermalCluster } from '@/types/cluster';
import { ClassificationDistributionChart } from '@/components/risk/ClassificationDistributionChart';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StackIcon } from './icons';

interface ClassificationDistributionCardProps {
  activeClusters: ThermalCluster[];
}

// Row 5, right card: active cases per classification, same data Row 2's
// classification cards already show, as a bar chart.
export function ClassificationDistributionCard({ activeClusters }: ClassificationDistributionCardProps) {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader label="Classification distribution" icon={StackIcon} />
      <div className="flex flex-1 items-center justify-center rounded-xl border border-base-700 bg-base-900 px-4 py-3">
        <ClassificationDistributionChart activeClusters={activeClusters} />
      </div>
    </div>
  );
}

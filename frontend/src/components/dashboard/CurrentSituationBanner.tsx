import type { ThermalCluster } from '@/types/cluster';
import { computeSituationLevel, SITUATION_LABELS, SITUATION_COLOR_CLASSES } from '@/lib/situation';
import { WarningTriangleIcon } from './icons';
import { SectionHeader } from '@/components/shared/SectionHeader';

interface CurrentSituationBannerProps {
  activeClusters: ThermalCluster[];
}

export function CurrentSituationBanner({ activeClusters }: CurrentSituationBannerProps) {
  const level = computeSituationLevel(activeClusters);
  const colors = SITUATION_COLOR_CLASSES[level];
  const criticalCount = activeClusters.filter((c) => c.risk_level === 'critical').length;

  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader label="Current situation" />
      <div className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-3 ${colors.border} ${colors.bg}`}>
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconText}`}
        >
          <WarningTriangleIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className={`font-mono text-[26px] font-bold uppercase leading-none tracking-[0.02em] ${colors.title}`}>
            {SITUATION_LABELS[level]}
          </div>
          <div className={`mt-2 font-mono text-[13px] leading-snug ${colors.body}`}>
            {activeClusters.length} active anomal{activeClusters.length === 1 ? 'y' : 'ies'}
          </div>
          <div className={`font-mono text-[13px] leading-snug ${colors.body}`}>
            {criticalCount} critical event{criticalCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  );
}

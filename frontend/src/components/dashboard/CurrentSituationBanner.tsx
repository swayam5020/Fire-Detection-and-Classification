import type { ThermalCluster } from '@/types/cluster';
import { computeSituationLevel, SITUATION_LABELS, SITUATION_COLOR_CLASSES } from '@/lib/situation';
import { WarningTriangleIcon } from './icons';

interface CurrentSituationBannerProps {
  activeClusters: ThermalCluster[];
}

export function CurrentSituationBanner({ activeClusters }: CurrentSituationBannerProps) {
  const level = computeSituationLevel(activeClusters);
  const colors = SITUATION_COLOR_CLASSES[level];
  const criticalCount = activeClusters.filter((c) => c.risk_level === 'critical').length;

  return (
    <div className={`flex items-center gap-4 rounded-sm border ${colors.border} ${colors.bg} px-5 py-4`}>
      <span
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 ${colors.border} ${colors.text}`}
      >
        <WarningTriangleIcon className="h-7 w-7" />
      </span>
      <div>
        <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Current situation</div>
        <div className={`font-mono text-2xl font-bold uppercase tracking-wider ${colors.text}`}>
          {SITUATION_LABELS[level]}
        </div>
        <div className="mt-1 text-sm text-ink-300">
          {activeClusters.length} active anomal{activeClusters.length === 1 ? 'y' : 'ies'}
        </div>
        <div className="text-sm text-ink-400">
          {criticalCount} critical event{criticalCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}

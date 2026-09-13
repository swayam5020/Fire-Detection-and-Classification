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
    <div className={`flex h-full items-center gap-4 rounded-xl border ${colors.border} ${colors.bg} px-6 py-5`}>
      <span
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 bg-base-900 ${colors.border} ${colors.text}`}
      >
        <WarningTriangleIcon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Current situation</div>
        <div className={`font-mono text-2xl font-bold uppercase tracking-wider ${colors.text}`}>
          {SITUATION_LABELS[level]}
        </div>
        <div className="mt-0.5 text-xs text-ink-300">
          {activeClusters.length} active anomal{activeClusters.length === 1 ? 'y' : 'ies'}
        </div>
        <div className="text-xs text-ink-400">
          {criticalCount} critical event{criticalCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}

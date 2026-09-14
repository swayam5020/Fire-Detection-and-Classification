import type { ClassificationType } from '@/types/cluster';
import { classificationAccentColor } from '@/lib/classification';
import { classificationIcon } from './icons';
import { cn } from '@/lib/utils';

interface ClassificationCardProps {
  classification: ClassificationType;
  label: string;
  totalCount: number;
  activeCount: number;
  onClick: () => void;
}

export function ClassificationCard({ classification, label, totalCount, activeCount, onClick }: ClassificationCardProps) {
  const color = classificationAccentColor(classification);
  const Icon = classificationIcon(classification);

  // With nothing live in this class there is no active case to open, so the
  // tile is dimmed and inert rather than navigating to a cluster whose alert
  // has already been acknowledged or resolved.
  const hasActiveCases = activeCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!hasActiveCases}
      title={`${activeCount} active / ${totalCount} total`}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-[filter,opacity]',
        hasActiveCases ? 'hover:brightness-[0.97]' : 'cursor-not-allowed opacity-50'
      )}
      style={{ borderColor: `${color}59`, backgroundColor: `${color}1f` }}
    >
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md"
        style={{ color, backgroundColor: `${color}2e` }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className="truncate font-mono text-[13px] font-bold leading-none text-ink-200">{label}</div>
        <div className="mt-1.5 font-mono text-[26px] font-bold leading-none text-ink-100">{activeCount}</div>
        <div className="mt-1.5 font-mono text-[12px] leading-none text-ink-400">
          active case{activeCount === 1 ? '' : 's'}
        </div>
      </div>
    </button>
  );
}

import type { ClassificationType } from '@/types/cluster';
import { classificationAccentColor } from '@/lib/classification';
import { classificationIcon } from './icons';

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

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${activeCount} active / ${totalCount} total`}
      className="flex w-full items-center gap-3.5 rounded-xl border border-base-700 bg-base-900 px-4 py-3.5 text-left transition-colors hover:border-ink-400"
    >
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: `${color}55`, color, backgroundColor: `${color}0f` }}
      >
        <Icon className="h-5.5 w-5.5" />
      </span>
      <div className="min-w-0">
        <div className="truncate font-mono text-2xs font-semibold uppercase tracking-wider text-ink-300">{label}</div>
        <div className="font-mono text-2xl font-bold text-ink-100">{activeCount}</div>
        <div className="font-mono text-2xs text-ink-500">active case{activeCount === 1 ? '' : 's'}</div>
      </div>
    </button>
  );
}

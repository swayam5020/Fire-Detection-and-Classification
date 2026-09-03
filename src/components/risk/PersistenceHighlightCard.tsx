import { formatDuration } from '@/lib/utils';

interface PersistenceHighlightCardProps {
  persistenceScore: number;
  durationHours: number;
}

export function PersistenceHighlightCard({ persistenceScore, durationHours }: PersistenceHighlightCardProps) {
  return (
    <div className="rounded-sm border border-base-700 bg-base-900 px-4 py-3">
      <div className="mb-1.5 font-mono text-2xs uppercase tracking-wider text-ink-500">Persistence</div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-2xl font-bold leading-none text-ink-100">
          {persistenceScore}
          <span className="text-xs font-normal text-ink-500"> / 100</span>
        </span>
        <span className="font-mono text-xs font-semibold text-ink-300">{formatDuration(durationHours)}</span>
      </div>
    </div>
  );
}

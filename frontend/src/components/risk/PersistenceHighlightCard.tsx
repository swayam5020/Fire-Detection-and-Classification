import { formatDuration } from '@/lib/utils';

interface PersistenceHighlightCardProps {
  persistenceScore: number;
  durationHours: number | null;
}

export function PersistenceHighlightCard({ persistenceScore, durationHours }: PersistenceHighlightCardProps) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900 px-3.5 py-3">
      <div className="mb-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">Persistence</div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-[28px] font-bold leading-none text-ink-100">
          {persistenceScore}
          <span className="font-mono text-[12px] font-normal text-ink-400"> / 100</span>
        </span>
        <span className="font-mono text-[11px] text-ink-300">{formatDuration(durationHours)}</span>
      </div>
    </div>
  );
}

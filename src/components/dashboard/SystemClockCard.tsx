import { useClock, formatUtcClock } from '@/hooks/useClock';

// Restyled to a vertical stack (label -> big time -> date/tz) to match the
// /dash reference layout. Still the same live UTC clock as before.
export function SystemClockCard() {
  const clock = useClock();

  return (
    <div className="flex h-full flex-col justify-between rounded-sm border border-base-700 bg-base-900 px-5 py-4">
      <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">System clock</div>
      <div className="my-1 font-mono text-3xl font-bold tabular-nums text-live">{formatUtcClock(clock)}</div>
      <div>
        <div className="text-sm text-ink-300">
          {clock.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
        </div>
        <div className="text-2xs text-ink-500">Coordinated Universal Time</div>
      </div>
    </div>
  );
}

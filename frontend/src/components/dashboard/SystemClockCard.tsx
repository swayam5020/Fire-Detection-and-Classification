import { useClock, formatUtcClock } from '@/hooks/useClock';
import { ClockIcon } from './icons';

// Matches the Row 1 card pattern (icon-in-circle + label + value) used by
// CurrentSituationBanner and SosAlertCard, with green as the system-status
// accent. Still the same live UTC clock as before, just restyled.
export function SystemClockCard() {
  const clock = useClock();

  return (
    <div className="flex h-full items-center gap-4 rounded-xl border border-live/30 bg-live/5 px-6 py-5">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-live/30 bg-base-900 text-live">
        <ClockIcon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">System time (UTC)</div>
        <div className="font-mono text-2xl font-bold tabular-nums text-live">{formatUtcClock(clock)}</div>
        <div className="mt-0.5 text-xs text-ink-300">
          {clock.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
        </div>
        <div className="text-xs text-ink-400">Coordinated Universal Time</div>
      </div>
    </div>
  );
}

import { useClock, formatUtcClock } from '@/hooks/useClock';
import { ClockIcon } from './icons';
import { SectionHeader } from '@/components/shared/SectionHeader';

// Matches the Row 1 card pattern (icon tile + value + supporting lines)
// used by CurrentSituationBanner and SosAlertCard, on the neutral card
// surface. Still the same live UTC clock as before, just restyled.
export function SystemClockCard() {
  const clock = useClock();

  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader label="System status" />
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-base-700 bg-base-900 px-4 py-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-base-700 bg-base-850 text-ink-200">
          <ClockIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="whitespace-nowrap font-mono text-[24px] font-bold leading-none tabular-nums text-ink-100">
            {formatUtcClock(clock)}
          </div>
          <div className="mt-2 font-mono text-[13px] leading-snug text-ink-300">
            {clock.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
          </div>
          <div className="font-mono text-[12px] leading-snug text-ink-400">Coordinated Universal Time</div>
        </div>
      </div>
    </div>
  );
}

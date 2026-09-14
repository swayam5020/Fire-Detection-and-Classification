import { NotificationBell } from './NotificationBell';
import { GlobeIcon, SignalBarsIcon } from '@/components/dashboard/icons';

const MOTTO = ['Detect', 'Analyze', 'Protect'];

// Top brand masthead, spanning the full shell width above the nav rail.
// Navigation itself lives in the left Sidebar — this bar carries the logo
// lockup, the motto, live/secure status and the alert bell (unchanged
// behavior, restyled).
export function Header() {
  return (
    <header className="flex h-16 flex-shrink-0 items-stretch bg-accent text-white">
      <div className="flex items-center gap-3 pl-2.5 pr-5">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-light">
          <GlobeIcon className="h-7 w-7" />
        </span>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[26px] font-bold leading-none tracking-[0.02em]">PYRON</span>
            <span className="font-mono text-[10px] leading-none text-white/75">v4.2-SEC</span>
          </div>
          <div className="mt-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.16em] text-white/75">
            Thermal Anomaly Monitoring System
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-9 pl-6 lg:flex">
        {MOTTO.map((word) => (
          <span key={word} className="font-mono text-[11px] uppercase tracking-[0.2em] text-white">
            <span className="text-map-accent">//</span> {word}
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4 px-4">
        <div className="hidden items-center gap-1.5 md:flex">
          <SignalBarsIcon className="h-3.5 w-3.5 text-white/80" />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/80">Secure-conn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="block h-2 w-2 animate-pulse-dot rounded-full bg-map-accent" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white">Live</span>
        </div>
        <NotificationBell />
      </div>

      <div className="hidden flex-shrink-0 items-stretch py-2 pr-2 xl:flex">
        <div className="flex flex-col justify-center rounded-lg bg-base-900 px-3.5 font-mono text-[9px] font-bold uppercase leading-[1.5] tracking-[0.08em] text-accent-dark">
          A cooler
          <br />
          safer
          <br />
          tomorrow.
        </div>
      </div>
    </header>
  );
}

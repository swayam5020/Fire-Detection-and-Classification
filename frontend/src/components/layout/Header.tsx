import { NavLink } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dash', label: 'Dashboard' },
  { to: '/map', label: 'Monitoring Map' },
  { to: '/history', label: 'Historical Logs' },
];

export function Header() {
  return (
    <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-base-700 bg-base-950 px-4">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="block h-2 w-2 rounded-full bg-thermal" />
          <span className="font-mono text-sm font-bold tracking-[0.15em] text-ink-100">PYRON</span>
          <span className="font-mono text-2xs text-ink-500">v4.2-SEC</span>
        </div>
        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'font-mono text-2xs font-semibold uppercase tracking-wider transition-colors',
                  isActive ? 'text-ink-100' : 'text-ink-400 hover:text-ink-200'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-live" />
          <span className="font-mono text-2xs font-semibold uppercase tracking-wider text-live">Live</span>
        </div>
        <NotificationBell />
        <div className="hidden items-center gap-1.5 md:flex">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-ink-400">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          </svg>
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-400">Secure-conn</span>
        </div>
      </div>
    </header>
  );
}

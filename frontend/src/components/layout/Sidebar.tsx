import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MonitorIcon, DocumentListIcon, GearIcon, GlobeIcon } from '@/components/dashboard/icons';

const NAV_ITEMS = [
  { to: '/dash', label: 'Dashboard', icon: MonitorIcon },
  { to: '/map', label: 'Monitoring Map', icon: GlobeIcon },
  { to: '/history', label: 'Historical Logs', icon: DocumentListIcon },
];

// Primary navigation rail — same three routes (NAV_ITEMS) and the same
// react-router NavLink behavior as before, restyled to the reference's
// narrow outlined-active treatment.
export function Sidebar() {
  return (
    <aside className="flex h-full w-52 flex-shrink-0 flex-col border-r border-base-700 bg-sidebar px-2.5 py-4">
      <nav className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg border px-2.5 py-2 font-mono text-[13px] font-bold transition-colors',
                isActive
                  ? 'border-accent bg-accent text-white'
                  : 'border-transparent text-ink-100 hover:bg-sidebar-hover'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border',
                    isActive ? 'border-transparent bg-accent-light text-white' : 'border-base-700 bg-base-900 text-ink-400'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2.5 border-t border-base-700 pt-3">
        <div className="flex items-center gap-2.5 px-2.5 font-mono text-[12px] font-bold leading-tight text-ink-300">
          <GearIcon className="h-4 w-4 flex-shrink-0" />
          System Settings
        </div>
        <div className="flex items-center gap-2.5 px-2.5 font-mono text-[11px] uppercase leading-tight tracking-[0.06em] text-ink-400">
          <GlobeIcon className="h-4 w-4 flex-shrink-0" />
          PYRON OS v4.2-SEC
        </div>
      </div>
    </aside>
  );
}

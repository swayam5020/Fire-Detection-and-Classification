import type { ThermalCluster } from '@/types/cluster';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { BellIcon } from './icons';

interface SosAlertCardProps {
  activeClusters: ThermalCluster[];
}

// Dashboard-specific alert summary. This is a visual, in-page entry point
// into the SOS alert queue modal alongside the header's global
// NotificationBell (which keeps working exactly as before, on every route)
// — it doesn't replace or reimplement the notification system, just
// reflects the same active-cluster count already computed on this page.
export function SosAlertCard({ activeClusters }: SosAlertCardProps) {
  const { openSosModal } = useNotificationCenter();
  const criticalCount = activeClusters.filter((c) => c.risk_level === 'critical').length;

  return (
    <div className="flex h-full items-center gap-4 rounded-xl border border-thermal/30 bg-thermal/5 px-6 py-5">
      <span className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-thermal/30 bg-base-900 text-thermal">
        <BellIcon className="h-6 w-6" />
        {activeClusters.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-base-900 bg-thermal px-0.5 font-mono text-[10px] font-bold leading-none text-white">
            {activeClusters.length}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-thermal">SOS Alerts</div>
        <div className="mt-0.5 text-xs text-ink-300">
          {activeClusters.length} active anomal{activeClusters.length === 1 ? 'y' : 'ies'}
        </div>
        <div className="text-xs text-ink-400">
          {criticalCount} critical event{criticalCount === 1 ? '' : 's'}
        </div>
      </div>
      <button
        type="button"
        onClick={openSosModal}
        className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-base-600 bg-base-900 px-3 py-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-ink-200 transition-colors hover:border-thermal hover:text-thermal"
      >
        View Alerts &rarr;
      </button>
    </div>
  );
}

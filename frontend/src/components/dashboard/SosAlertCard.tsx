import { useNavigate } from 'react-router-dom';
import type { ThermalCluster } from '@/types/cluster';
import { BellIcon } from './icons';

interface SosAlertCardProps {
  activeClusters: ThermalCluster[];
}

// Dashboard-specific alert summary. This is a visual, in-page entry point
// into /alert alongside the header's global NotificationBell (which keeps
// working exactly as before, on every route) — it doesn't replace or
// reimplement the notification system, just reflects the same active-cluster
// count already computed on this page.
export function SosAlertCard({ activeClusters }: SosAlertCardProps) {
  const navigate = useNavigate();
  const criticalCount = activeClusters.filter((c) => c.risk_level === 'critical').length;

  return (
    <button
      type="button"
      onClick={() => navigate('/alert')}
      className="flex h-full items-center gap-4 rounded-sm border border-thermal bg-thermal/10 px-5 py-4 text-left shadow-[0_0_24px_4px_rgba(224,64,47,0.25)] transition-colors hover:bg-thermal/15"
    >
      <span className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-thermal bg-thermal/20 text-thermal">
        <BellIcon className="h-7 w-7" />
        {activeClusters.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-base-950 bg-thermal font-mono text-[10px] font-bold text-ink-100">
            {activeClusters.length}
          </span>
        )}
      </span>
      <div>
        <div className="font-mono text-xl font-bold uppercase tracking-wider text-thermal">SOS Alert</div>
        <div className="mt-1 text-sm text-ink-200">
          {activeClusters.length} active anomal{activeClusters.length === 1 ? 'y' : 'ies'}
        </div>
        <div className="text-sm text-ink-400">
          {criticalCount} critical event{criticalCount === 1 ? '' : 's'}
        </div>
      </div>
    </button>
  );
}

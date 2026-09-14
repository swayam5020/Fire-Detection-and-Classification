import type { SosAlert } from '@/types/alert';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { RiskBadge } from '@/components/risk/RiskBadge';
import { BellIcon } from '@/components/dashboard/icons';

interface SosArrivalBannerProps {
  alert: SosAlert;
}

// A large, hard-to-miss overlay announcing a brand-new SOS alert, shown in
// front of whatever page the person is currently on. Stays up until they
// click it — clicking opens the SOS modal (the acknowledgement action) and
// dismisses this banner; it never auto-dismisses or navigates on its own.
export function SosArrivalBanner({ alert }: SosArrivalBannerProps) {
  const { openSosModal } = useNotificationCenter();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <button
        type="button"
        onClick={openSosModal}
        className="pointer-events-auto flex w-full max-w-md items-center gap-4 rounded-xl border border-thermal bg-base-900 px-5 py-4 text-left shadow-lg shadow-black/40"
      >
        <span className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-thermal bg-thermal/10 text-thermal">
          <span className="absolute inline-flex h-12 w-12 animate-pulse-ring rounded-full bg-thermal" />
          <BellIcon className="relative h-6 w-6 animate-bell-shake" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-thermal">New SOS Alert</div>
          <div className="mt-0.5 flex items-center gap-2">
            <RiskBadge level={alert.severity} />
            <span className="truncate font-mono text-2xs text-ink-300">
              Cluster {alert.cluster_id} &middot; {alert.location}
            </span>
          </div>
        </div>
        <span className="flex-shrink-0 font-mono text-2xs font-bold uppercase tracking-wider text-thermal">
          View &rarr;
        </span>
      </button>
    </div>
  );
}

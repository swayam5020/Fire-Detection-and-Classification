import type { ThermalCluster } from '@/types/cluster';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { BellIcon } from './icons';
import { SectionHeader } from '@/components/shared/SectionHeader';

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

  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader label="SOS alerts" />
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-base-700 bg-base-900 px-4 py-3">
        <span
          className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#FED7D7] text-[#EF4444]"
          title={`${activeClusters.length} active anomalies`}
        >
          <BellIcon className="h-6 w-6" />
          {activeClusters.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-base-900 bg-thermal px-0.5 font-mono text-[10px] font-bold leading-none text-white">
              {activeClusters.length}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={openSosModal}
          className="flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-accent px-4 font-mono text-[17px] font-bold text-white transition-colors hover:bg-accent-hover"
        >
          View Alerts &rarr;
        </button>
      </div>
    </div>
  );
}

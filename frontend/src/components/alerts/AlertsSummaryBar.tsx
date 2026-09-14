import type { SosAlert } from '@/types/alert';
import { cn } from '@/lib/utils';

interface AlertsSummaryBarProps {
  alerts: SosAlert[];
  severityFilter: SosAlert['severity'] | 'all';
  onSeverityChange: (value: SosAlert['severity'] | 'all') => void;
}

const SEVERITIES: SosAlert['severity'][] = ['critical', 'high', 'medium', 'low'];

export function AlertsSummaryBar({ alerts, severityFilter, onSeverityChange }: AlertsSummaryBarProps) {
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const ackCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-accent-header px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[13px] font-bold uppercase leading-none tracking-[0.1em] text-white">
          // Historical logs
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/70">Severity:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSeverityChange('all')}
              className={cn(
                'rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.08em] transition-colors',
                severityFilter === 'all'
                  ? 'border-white bg-white text-accent-dark'
                  : 'border-white/40 text-white/75 hover:border-white hover:text-white'
              )}
            >
              All
            </button>
            {SEVERITIES.map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => onSeverityChange(sev)}
                className={cn(
                  'rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.08em] transition-colors',
                  severityFilter === sev
                    ? 'border-white bg-white text-accent-dark'
                    : 'border-white/40 text-white/75 hover:border-white hover:text-white'
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/70">
        {activeCount} Active &middot; {ackCount} Acknowledged &middot; {resolvedCount} Resolved
      </span>
    </div>
  );
}

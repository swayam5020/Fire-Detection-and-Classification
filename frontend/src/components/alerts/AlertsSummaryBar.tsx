import type { SosAlert } from '@/types/alert';
import { cn } from '@/lib/utils';

interface AlertsSummaryBarProps {
  alerts: SosAlert[];
  severityFilter: SosAlert['severity'] | 'all';
  onSeverityChange: (value: SosAlert['severity'] | 'all') => void;
}

const SEVERITIES: SosAlert['severity'][] = ['critical', 'high', 'medium'];

export function AlertsSummaryBar({ alerts, severityFilter, onSeverityChange }: AlertsSummaryBarProps) {
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const ackCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="flex items-center justify-between border-b border-base-700 bg-base-950 px-4 py-2">
      <span className="font-mono text-2xs uppercase tracking-wider text-ink-400">
        {activeCount} Active &middot; {ackCount} Acknowledged &middot; {resolvedCount} Resolved
      </span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Severity:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSeverityChange('all')}
            className={cn(
              'rounded-sm border px-2 py-0.5 font-mono text-2xs uppercase tracking-wider transition-colors',
              severityFilter === 'all' ? 'border-ink-300 text-ink-100' : 'border-base-600 text-ink-500 hover:text-ink-300'
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
                'rounded-sm border px-2 py-0.5 font-mono text-2xs uppercase tracking-wider transition-colors',
                severityFilter === sev ? 'border-ink-300 text-ink-100' : 'border-base-600 text-ink-500 hover:text-ink-300'
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { SosAlert } from '@/types/alert';
import { formatUtcDateTime, formatUtcTime, cn } from '@/lib/utils';

interface AlertDetailPanelProps {
  alert: SosAlert;
}

const SEVERITY_TEXT: Record<SosAlert['severity'], string> = {
  critical: 'text-risk-critical',
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};

const TEAM_STATUS_LABEL: Record<SosAlert['assigned_team_status'], string> = {
  on_call: 'ON CALL',
  dispatched: 'DISPATCHED',
  standby: 'STANDBY',
};

export function AlertDetailPanel({ alert }: AlertDetailPanelProps) {
  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-l border-base-700 bg-base-950">
      <div className="border-b border-base-700 px-4 py-3">
        <div className="mb-1 flex items-center justify-between">
          <span className={cn('font-mono text-2xs font-bold uppercase tracking-wider', SEVERITY_TEXT[alert.severity])}>
            {alert.severity} SOS incident
          </span>
          <span className="font-mono text-2xs text-ink-500">{formatUtcTime(alert.timestamp)}</span>
        </div>
        <div className="font-mono text-sm font-bold text-ink-100">Incident {alert.alert_id}</div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        <Section title="Associated risk target">
          <div className="flex items-center justify-between rounded-sm border border-base-700 bg-base-900 px-2.5 py-1.5">
            <span className="font-mono text-xs font-semibold text-ink-100">Cluster {alert.cluster_id}</span>
            <span className="text-2xs text-ink-500">{alert.location}</span>
          </div>
        </Section>

        <Section title="Automated risk assessment">
          <p className="text-xs leading-relaxed text-ink-300">{alert.automated_assessment}</p>
        </Section>

        <Section title="Protocol recommended actions">
          <ol className="space-y-1.5">
            {alert.recommended_actions.map((action, i) => (
              <li key={action} className="flex gap-2 text-2xs text-ink-300">
                <span className="font-mono text-ink-500">{i + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Assigned dispatch team">
          <div className="flex items-center justify-between rounded-sm border border-base-700 bg-base-900 px-2.5 py-1.5">
            <span className="text-xs font-semibold text-ink-100">{alert.assigned_team}</span>
            <span className="font-mono text-2xs font-semibold uppercase tracking-wider text-live">
              {TEAM_STATUS_LABEL[alert.assigned_team_status]}
            </span>
          </div>
        </Section>

        <Section title="Log timeline">
          <ul className="space-y-2 border-l border-base-700 pl-3">
            {alert.log_timeline.map((entry) => (
              <li key={entry.timestamp + entry.message} className="relative text-2xs">
                <span className="absolute -left-[15px] top-1 block h-1.5 w-1.5 rounded-full bg-base-500" />
                <div className="font-mono text-ink-500">{formatUtcDateTime(entry.timestamp)}</div>
                <div className="text-ink-300">{entry.message}</div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-500">{title}</div>
      {children}
    </div>
  );
}

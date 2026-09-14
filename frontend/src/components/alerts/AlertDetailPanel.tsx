import type { SosAlert } from '@/types/alert';
import { formatUtcDateTime, formatUtcTime, cn } from '@/lib/utils';
import { SectionHeader } from '@/components/shared/SectionHeader';

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
    <aside className="flex h-full w-full flex-col gap-3 overflow-y-auto bg-base-950 p-3">
      <SectionHeader label="Alert details" labelClassName="text-[13px] tracking-[0.1em]" className="py-2" />
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span
            className={cn('font-mono text-[11px] font-bold uppercase tracking-[0.06em]', SEVERITY_TEXT[alert.severity])}
          >
            {alert.severity} SOS incident
          </span>
          <span className="flex-shrink-0 font-mono text-[10px] text-ink-400">{formatUtcTime(alert.timestamp)}</span>
        </div>
        <div className="font-mono text-[18px] font-bold leading-none text-ink-100">Incident {alert.alert_id}</div>
      </div>

      <div className="flex flex-col gap-4">
        <Section title="Associated risk target">
          <div className="flex items-center justify-between gap-2 rounded-md border border-base-700 bg-base-900 px-3 py-2">
            <span className="font-mono text-[13px] font-bold text-ink-100">Cluster {alert.cluster_id}</span>
            <span className="truncate text-[11px] text-ink-400">{alert.location}</span>
          </div>
        </Section>

        <Section title="Automated risk assessment">
          <p className="text-[12px] leading-relaxed text-ink-300">{alert.automated_assessment}</p>
        </Section>

        <Section title="Protocol recommended actions">
          <ol className="space-y-1.5">
            {alert.recommended_actions.map((action, i) => (
              <li key={action} className="flex gap-2 text-[12px] leading-relaxed text-ink-300">
                <span className="flex-shrink-0 font-mono font-bold text-ink-400">{i + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Assigned dispatch team">
          <div className="flex items-center justify-between gap-2 rounded-md border border-base-700 bg-base-900 px-3 py-2">
            <span className="truncate font-mono text-[13px] font-bold text-ink-100">{alert.assigned_team}</span>
            <span className="inline-flex flex-shrink-0 rounded bg-[#DCFCE7] px-2 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.08em] text-[#166534]">
              {TEAM_STATUS_LABEL[alert.assigned_team_status]}
            </span>
          </div>
        </Section>

        <Section title="Log timeline">
          <ul className="space-y-2.5 border-l border-base-700 pl-3.5">
            {alert.log_timeline.map((entry) => (
              <li key={entry.timestamp + entry.message} className="relative">
                <span className="absolute -left-[17px] top-1 block h-2 w-2 rounded-full bg-[#38BDF8]" />
                <div className="font-mono text-[10px] text-ink-400">{formatUtcDateTime(entry.timestamp)}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-ink-200">{entry.message}</div>
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
      <div className="mb-1.5 font-mono text-[10px] uppercase leading-none tracking-[0.08em] text-ink-400">{title}</div>
      {children}
    </div>
  );
}

import type { SosAlert } from '@/types/alert';
import { formatUtcTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AlertsTableProps {
  alerts: SosAlert[];
  selectedAlertId: string | null;
  onSelect: (alertId: string) => void;
}

const SEVERITY_ORDER: Record<SosAlert['severity'], number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER: Record<SosAlert['status'], number> = { active: 0, acknowledged: 1, resolved: 2 };

const SEVERITY_TEXT: Record<SosAlert['severity'], string> = {
  critical: 'text-risk-critical',
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};

const SEVERITY_DOT: Record<SosAlert['severity'], string> = {
  critical: 'bg-risk-critical',
  high: 'bg-risk-high',
  medium: 'bg-risk-medium',
  low: 'bg-risk-low',
};

// Tinted pill + darker ink per state, so each reads at AA on the cream rows.
const STATUS_STYLES: Record<SosAlert['status'], string> = {
  active: 'bg-[#DCFCE7] text-[#166534]',
  acknowledged: 'bg-[#FEF0CD] text-[#92400E]',
  resolved: 'bg-[#E5E7EB] text-[#6B7280]',
};

export function AlertsTable({ alerts, selectedAlertId, onSelect }: AlertsTableProps) {
  const sorted = [...alerts].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  });

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-accent-header text-left">
          <Th>Severity</Th>
          <Th>Alert ID</Th>
          <Th>Target ID</Th>
          <Th>Location</Th>
          <Th>Timestamp</Th>
          <Th>Trigger description</Th>
          <Th align="right">Status</Th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((alert, i) => (
          <tr
            key={alert.alert_id}
            onClick={() => onSelect(alert.alert_id)}
            className={cn(
              'cursor-pointer border-b border-base-800 transition-colors hover:bg-[#D6EADF]',
              selectedAlertId === alert.alert_id
                ? 'bg-[#C7E5DF]'
                : i % 2 === 0
                  ? 'bg-[#F6F2DE]'
                  : 'bg-[#EEE8D2]'
            )}
          >
            <Td className="whitespace-nowrap">
              <span className="flex items-center gap-2">
                <span className={cn('block h-2 w-2 flex-shrink-0 rounded-full', SEVERITY_DOT[alert.severity])} />
                <span
                  className={cn(
                    'font-mono text-[11px] font-bold uppercase tracking-[0.06em]',
                    SEVERITY_TEXT[alert.severity]
                  )}
                >
                  {alert.severity}
                </span>
              </span>
            </Td>
            <Td mono className="text-ink-100">
              {alert.alert_id}
            </Td>
            <Td mono className="text-ink-300">
              {alert.cluster_id}
            </Td>
            <Td className="whitespace-nowrap text-ink-200">{alert.location}</Td>
            <Td mono className="text-ink-300">
              {formatUtcTime(alert.timestamp)}
            </Td>
            <Td className="max-w-xs truncate text-ink-300">{alert.reason}</Td>
            <Td align="right" className="whitespace-nowrap">
              <span
                className={cn(
                  'inline-flex rounded px-2 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.08em]',
                  STATUS_STYLES[alert.status]
                )}
              >
                {alert.status}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Table headers are Space Mono bold in the key's header-text cream.
function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-base-950',
        align === 'right' && 'text-right'
      )}
    >
      {children}
    </th>
  );
}

// `mono` marks the technical columns (IDs, timestamps); everything else is
// table content and stays in Inter per the key.
function Td({
  children,
  mono,
  className,
  align,
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
  align?: 'right';
}) {
  return (
    <td
      className={cn(
        'px-3 py-2.5 text-[12px] leading-snug text-ink-200',
        mono && 'whitespace-nowrap font-mono',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  );
}

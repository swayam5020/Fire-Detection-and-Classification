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

const STATUS_TEXT: Record<SosAlert['status'], string> = {
  active: 'text-live',
  acknowledged: 'text-risk-medium',
  resolved: 'text-ink-500',
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
        <tr className="border-b border-base-700 text-left">
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
        {sorted.map((alert) => (
          <tr
            key={alert.alert_id}
            onClick={() => onSelect(alert.alert_id)}
            className={cn(
              'cursor-pointer border-b border-base-800 transition-colors hover:bg-base-850',
              selectedAlertId === alert.alert_id && 'bg-base-850'
            )}
          >
            <Td>
              <span className={cn('font-mono text-2xs font-bold uppercase tracking-wider', SEVERITY_TEXT[alert.severity])}>
                {alert.severity}
              </span>
            </Td>
            <Td mono>{alert.alert_id}</Td>
            <Td mono className="text-ink-400">
              {alert.cluster_id}
            </Td>
            <Td>{alert.location}</Td>
            <Td mono className="text-ink-400">
              {formatUtcTime(alert.timestamp)}
            </Td>
            <Td className="max-w-xs truncate text-ink-300">{alert.reason}</Td>
            <Td align="right">
              <span className={cn('font-mono text-2xs font-semibold uppercase tracking-wider', STATUS_TEXT[alert.status])}>
                {alert.status}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th className={cn('px-3 py-2 font-mono text-2xs font-semibold uppercase tracking-wider text-ink-500', align === 'right' && 'text-right')}>
      {children}
    </th>
  );
}

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
        'px-3 py-2 text-xs text-ink-200',
        mono && 'font-mono',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  );
}

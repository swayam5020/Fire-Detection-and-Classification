import type { ThermalCluster } from '@/types/cluster';

interface StatStripProps {
  clusters: ThermalCluster[];
}

export function StatStrip({ clusters }: StatStripProps) {
  const activeCount = clusters.length;
  const highRiskCount = clusters.filter((c) => c.risk_level === 'high' || c.risk_level === 'critical').length;
  const criticalCount = clusters.filter((c) => c.risk_level === 'critical').length;
  const regionCount = new Set(clusters.map((c) => c.region)).size;

  return (
    <div className="grid flex-shrink-0 grid-cols-2 gap-px border-t border-base-700 bg-base-700 sm:grid-cols-4">
      <Stat label="Active anomalies" value={String(activeCount)} note="+3 in last 24h" />
      <Stat label="High-risk detected" value={String(highRiskCount).padStart(2, '0')} note="Immediate attention" accent="high" />
      <Stat label="Critical SOS alerts" value={String(criticalCount).padStart(2, '0')} note="Response active" accent="critical" />
      <Stat label="Monitored regions" value={String(regionCount)} note="Global satellites connected" />
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent?: 'high' | 'critical';
}) {
  const valueColor = accent === 'critical' ? 'text-risk-critical' : accent === 'high' ? 'text-risk-high' : 'text-ink-100';
  return (
    <div className="bg-base-950 px-4 py-2.5">
      <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`font-mono text-lg font-bold ${valueColor}`}>{value}</div>
      <div className="text-2xs text-ink-500">{note}</div>
    </div>
  );
}

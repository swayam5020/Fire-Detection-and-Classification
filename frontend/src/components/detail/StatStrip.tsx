import type { ThermalCluster } from '@/types/cluster';

interface StatStripProps {
  clusters: ThermalCluster[];
}

export function StatStrip({ clusters }: StatStripProps) {
  const activeCount = clusters.length;
  const highRiskCount = clusters.filter((c) => c.risk_level === 'high' || c.risk_level === 'critical').length;
  const criticalCount = clusters.filter((c) => c.risk_level === 'critical').length;
  // Only clusters whose region the backend actually resolved are counted —
  // otherwise every unnamed one would collapse into a single phantom region.
  const regionCount = new Set(clusters.map((c) => c.region).filter((r): r is string => r != null)).size;

  return (
    <div className="grid flex-shrink-0 grid-cols-2 gap-px overflow-hidden rounded-lg border border-base-700 bg-base-700 sm:grid-cols-4">
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
    <div className="bg-base-900 px-4 py-2.5">
      <div className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">{label}</div>
      <div className={`mt-1.5 font-mono text-[22px] font-bold leading-none ${valueColor}`}>{value}</div>
      <div className="mt-1.5 text-[10px] leading-none text-ink-400">{note}</div>
    </div>
  );
}

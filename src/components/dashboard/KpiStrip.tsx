interface Kpi {
  label: string;
  value: number;
  accent?: 'high' | 'critical';
}

interface KpiStripProps {
  items: Kpi[];
}

export function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-base-700 bg-base-700 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-base-900 px-4 py-3">
          <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">{item.label}</div>
          <div
            className={`font-mono text-2xl font-bold ${
              item.accent === 'critical' ? 'text-risk-critical' : item.accent === 'high' ? 'text-risk-high' : 'text-ink-100'
            }`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

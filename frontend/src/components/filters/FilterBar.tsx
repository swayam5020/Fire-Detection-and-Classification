import type { ClusterFilters, ClassificationType, ThermalCluster } from '@/types/cluster';
import { CLASSIFICATION_LABELS } from '@/lib/classification';

interface FilterBarProps {
  filters: ClusterFilters;
  onChange: (filters: ClusterFilters) => void;
  clusters: ThermalCluster[];
}

// Risk level and time range filters now live in the enlarged bottom-left
// map control panel (MapControlPanel), alongside the legend. This top bar
// keeps only the infrastructure/type filter.
export function FilterBar({ filters, onChange, clusters }: FilterBarProps) {
  const setClassification = (value: string) => {
    onChange({
      ...filters,
      classifications: value === 'all' ? [] : [value as ClassificationType],
    });
  };

  return (
    <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-300">Type :</span>
        <select
          value={filters.classifications[0] ?? 'all'}
          onChange={(e) => setClassification(e.target.value)}
          className="min-w-[190px] rounded-md border border-base-700 bg-base-900 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-accent-dark outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Infrastructure</option>
          {Object.entries(CLASSIFICATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <span className="ml-auto text-[11px] text-ink-400">{clusters.length} tracked anomalies</span>
    </div>
  );
}

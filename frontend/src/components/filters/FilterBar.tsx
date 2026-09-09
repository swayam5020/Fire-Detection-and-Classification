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
    <div className="flex flex-wrap items-center gap-4 border-b border-base-700 bg-base-950 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Type:</span>
        <select
          value={filters.classifications[0] ?? 'all'}
          onChange={(e) => setClassification(e.target.value)}
          className="rounded-sm border border-base-600 bg-base-900 px-2 py-0.5 font-mono text-2xs uppercase tracking-wider text-ink-300 outline-none focus:border-ink-400"
        >
          <option value="all">All Infrastructure</option>
          {Object.entries(CLASSIFICATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <span className="ml-auto font-mono text-2xs text-ink-500">{clusters.length} tracked anomalies</span>
    </div>
  );
}

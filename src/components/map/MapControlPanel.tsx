import type { ClusterFilters, RiskLevel, ThermalCluster } from '@/types/cluster';
import { cn } from '@/lib/utils';
import { riskDotColor } from '@/components/risk/RiskBadge';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { formatRangeLabel } from '@/lib/dateRange';

interface MapControlPanelProps {
  filters: ClusterFilters;
  onChange: (filters: ClusterFilters) => void;
  clusters: ThermalCluster[];
}

const RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
const TIME_PRESETS: Array<'24h' | '7d' | '30d'> = ['24h', '7d', '30d'];

const RISK_BUTTON_ACTIVE: Record<RiskLevel, string> = {
  critical: 'border-risk-critical text-risk-critical',
  high: 'border-risk-high text-risk-high',
  medium: 'border-risk-medium text-risk-medium',
  low: 'border-risk-low text-risk-low',
};

function countByRisk(clusters: ThermalCluster[], level: RiskLevel): number {
  return clusters.filter((c) => c.risk_level === level).length;
}

export function MapControlPanel({ filters, onChange, clusters }: MapControlPanelProps) {
  const toggleRisk = (level: RiskLevel) => {
    const active = filters.riskLevels.includes(level);
    onChange({
      ...filters,
      riskLevels: active ? filters.riskLevels.filter((l) => l !== level) : [...filters.riskLevels, level],
    });
  };

  const allActive = filters.riskLevels.length === RISK_LEVELS.length;
  const setAll = () => onChange({ ...filters, riskLevels: allActive ? [] : RISK_LEVELS });

  return (
    <div className="absolute bottom-3 left-3 z-10 flex w-[320px] flex-col gap-3 rounded-sm border border-base-700 bg-base-950/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Risk status</span>
        <LegendDot color={riskDotColor('critical')} label="High / Critical" />
        <LegendDot color={riskDotColor('medium')} label="Medium" />
        <LegendDot color={riskDotColor('low')} label="Low" />
      </div>

      <div className="h-px bg-base-700" />

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Risk level</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={setAll}
            className={cn(
              'rounded-sm border px-2.5 py-1 font-mono text-2xs uppercase tracking-wider transition-colors',
              allActive ? 'border-ink-300 text-ink-100' : 'border-base-600 text-ink-500 hover:text-ink-300'
            )}
          >
            All ({clusters.length})
          </button>
          {RISK_LEVELS.map((level) => {
            const active = filters.riskLevels.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleRisk(level)}
                className={cn(
                  'rounded-sm border px-2.5 py-1 font-mono text-2xs uppercase tracking-wider transition-colors',
                  active ? RISK_BUTTON_ACTIVE[level] : 'border-base-600 text-ink-500 hover:text-ink-300'
                )}
              >
                {level} ({countByRisk(clusters, level)})
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-base-700" />

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Time range</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {TIME_PRESETS.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onChange({ ...filters, timeRange: range })}
              className={cn(
                'rounded-sm border px-2.5 py-1 font-mono text-2xs uppercase tracking-wider transition-colors',
                filters.timeRange === range
                  ? 'border-ink-300 text-ink-100'
                  : 'border-base-600 text-ink-500 hover:text-ink-300'
              )}
            >
              {range}
            </button>
          ))}
          <DateRangePicker
            value={filters.customRange ?? null}
            active={filters.timeRange === 'custom'}
            triggerLabel={filters.timeRange === 'custom' && filters.customRange ? formatRangeLabel(filters.customRange) : 'Custom'}
            onChange={(range) => onChange({ ...filters, timeRange: 'custom', customRange: range })}
          />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-mono text-2xs text-ink-400">{label}</span>
    </span>
  );
}

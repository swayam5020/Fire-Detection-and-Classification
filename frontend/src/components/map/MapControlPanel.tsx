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

// Selected: filled in the level's own colour. Unselected: the same colour
// as an outline, so every level stays legible against the dark map panel
// (the reference keeps all four tinted at rest, not greyed out).
const RISK_BUTTON_ACTIVE: Record<RiskLevel, string> = {
  critical: 'border-risk-critical bg-risk-critical text-white',
  high: 'border-risk-high bg-risk-high text-ink-100',
  medium: 'border-risk-medium bg-risk-medium text-ink-100',
  low: 'border-risk-low bg-risk-low text-ink-100',
};

const RISK_BUTTON_IDLE: Record<RiskLevel, string> = {
  critical: 'border-risk-critical/70 text-risk-critical hover:bg-risk-critical/15',
  high: 'border-risk-high/70 text-risk-high hover:bg-risk-high/15',
  medium: 'border-risk-medium/70 text-risk-medium hover:bg-risk-medium/15',
  low: 'border-risk-low/70 text-risk-low hover:bg-risk-low/15',
};

// Neutral pills (All / time range) on the dark panel.
const NEUTRAL_ACTIVE = 'border-[#C9C1A7] bg-accent text-white';
const NEUTRAL_IDLE = 'border-[#C9C1A7]/40 text-[#E8E1C9]/70 hover:border-[#C9C1A7] hover:text-[#E8E1C9]';

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
    <div className="absolute bottom-3 left-3 z-10 flex w-[300px] flex-col gap-2.5 rounded-lg border border-[#284B4D] bg-[#0F2F30]/95 px-3.5 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="w-12 flex-shrink-0 font-mono text-[9px] uppercase leading-[1.3] tracking-[0.08em] text-[#E8E1C9]/60">
          Risk status
        </span>
        <LegendDot color={riskDotColor('critical')} label="High / Critical" />
        <LegendDot color={riskDotColor('medium')} label="Medium" />
        <LegendDot color={riskDotColor('low')} label="Low" />
      </div>

      <div className="h-px bg-[#284B4D]" />

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#E8E1C9]/60">Risk level</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={setAll}
            className={cn(
              'rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.06em] transition-colors',
              allActive ? NEUTRAL_ACTIVE : NEUTRAL_IDLE
            )}
          >
            All ({clusters.length})
          </button>
          {RISK_LEVELS.map((level) => {
            // With every level selected, "All" is the chip that reads as
            // active and the per-level chips sit at rest — the reference's
            // treatment. Toggling behaviour is unchanged either way.
            const active = filters.riskLevels.includes(level) && !allActive;
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleRisk(level)}
                className={cn(
                  'rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.06em] transition-colors',
                  active ? RISK_BUTTON_ACTIVE[level] : RISK_BUTTON_IDLE[level]
                )}
              >
                {level} ({countByRisk(clusters, level)})
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#284B4D]" />

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#E8E1C9]/60">Time range</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {TIME_PRESETS.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onChange({ ...filters, timeRange: range })}
              className={cn(
                'rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.06em] transition-colors',
                filters.timeRange === range ? NEUTRAL_ACTIVE : NEUTRAL_IDLE
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
      <span className="block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-mono text-[9px] leading-[1.3] text-[#E8E1C9]/85">{label}</span>
    </span>
  );
}

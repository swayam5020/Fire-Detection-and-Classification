import type { ThermalCluster, RiskLevel } from '@/types/cluster';
import { RiskBadge, RISK_TEXT_CLASS } from '@/components/risk/RiskBadge';
import { RiskBar } from '@/components/risk/RiskBar';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EspTelemetryCard } from '@/components/detail/EspTelemetryCard';
import { classificationAccentColor } from '@/lib/classification';
import { classificationIcon, MapPinIcon, StackIcon } from '@/components/dashboard/icons';
import {
  coordString,
  formatDuration,
  formatPercent,
  formatRelativeShort,
  formatScore,
  formatUtcDateTime,
  MISSING_VALUE,
} from '@/lib/utils';

interface ActiveCaseCardProps {
  cluster: ThermalCluster;
  onViewOnMap: (clusterId: string) => void;
}

// Level-coloured outline, matching the treatment RiskHighlightCard uses on
// /map so a case reads the same wherever it appears.
const LEVEL_BORDER: Record<RiskLevel, string> = {
  critical: 'border-risk-critical/40',
  high: 'border-risk-high/40',
  medium: 'border-risk-medium/40',
  low: 'border-risk-low/40',
};

export function ActiveCaseCard({ cluster, onViewOnMap }: ActiveCaseCardProps) {
  const ClassIcon = classificationIcon(cluster.classification);
  const classColor = classificationAccentColor(cluster.classification);

  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader
        label={cluster.cluster_id}
        right={<span className="font-mono text-[10px] text-white/75">{formatRelativeShort(cluster.timestamp)}</span>}
      />

      <div className={`flex flex-1 flex-col gap-3 rounded-lg border bg-base-900 p-3.5 ${LEVEL_BORDER[cluster.risk_level]}`}>
        {/* 1 — risk level + score, the highest-priority signal */}
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">Risk</div>
          <div className="mb-2 flex items-end justify-between gap-3">
            <span className={`font-mono text-[34px] font-bold leading-none ${RISK_TEXT_CLASS[cluster.risk_level]}`}>
              {formatScore(cluster.risk_score)}
              <span className="font-mono text-[13px] font-normal text-ink-400"> / 100</span>
            </span>
            <RiskBadge level={cluster.risk_level} size="lg" tone="solid" />
          </div>
          <RiskBar score={cluster.risk_score} level={cluster.risk_level} />
        </div>

        {/* 2 — AI classification */}
        <div className="flex items-center gap-2.5 border-t border-base-800 pt-3">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border"
            style={{ color: classColor, backgroundColor: `${classColor}24`, borderColor: `${classColor}59` }}
          >
            <ClassIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">
              AI classification
            </div>
            <div className="mt-1 truncate text-[13px] font-semibold leading-none text-ink-100">
              {cluster.classification_label}
            </div>
          </div>
        </div>

        {/* 3 — location */}
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-base-700 bg-base-950 text-ink-400">
            <MapPinIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">Location</div>
            <div className="mt-1 truncate text-[13px] font-semibold leading-tight text-ink-100">
              {cluster.region ?? MISSING_VALUE}
            </div>
            <div className="mt-0.5 truncate font-mono text-[10px] leading-tight text-ink-400">
              {coordString(cluster.centroid.lat, cluster.centroid.lon)}
            </div>
          </div>
        </div>

        {/* 4 — persistence + telemetry */}
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Persistence" value={`${cluster.persistence_score}`} suffix="/100" />
          <Metric label="Duration" value={formatDuration(cluster.duration_hours).replace(' continuous', '')} />
          <Metric label="FRP" value={cluster.frp?.toFixed(1) ?? MISSING_VALUE} suffix="MW" />
          <Metric label="Brightness" value={cluster.brightness?.toFixed(1) ?? MISSING_VALUE} suffix="K" />
        </div>

        <div className="rounded-md border border-base-800 bg-base-850 px-2.5 py-2">
          <Row label="First detected" value={formatUtcDateTime(cluster.first_detected)} />
          <Row label="Last detected" value={formatUtcDateTime(cluster.last_detected)} />
          <Row label="FIRMS confidence" value={formatPercent(cluster.confidence)} />
        </div>

        {/* Ground-sensor readings, kept distinct from the satellite-derived
            metrics above. Renders "—" per field when no ESP32 is deployed. */}
        <EspTelemetryCard esp32={cluster.esp32} />

        {cluster.facility && (
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-base-700 bg-base-950 text-ink-400">
              <StackIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">
                Adjacent infrastructure
              </div>
              <div className="mt-1 truncate text-[13px] font-semibold leading-tight text-ink-100">
                {cluster.facility.name ?? MISSING_VALUE}
              </div>
              <Row label="Facility type" value={cluster.facility.facility_type ?? MISSING_VALUE} />
              <Row label="Est. proximity" value={`${cluster.facility.distance_km.toFixed(1)}km radial`} emphasize />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => onViewOnMap(cluster.cluster_id)}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 font-mono text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-white transition-colors hover:bg-accent-hover"
        >
          View on Map &rarr;
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-md border border-base-800 bg-base-850 px-2.5 py-2">
      <div className="truncate font-mono text-[9px] uppercase leading-none text-ink-400">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="font-mono text-[17px] font-bold leading-none text-ink-100">{value}</span>
        {/* A unit beside an em dash reads as a measurement; hide it when absent. */}
        {suffix && value !== MISSING_VALUE && (
          <span className="font-mono text-[10px] leading-none text-ink-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="flex-shrink-0 text-[11px] text-ink-400">{label}:</span>
      <span className={`truncate font-mono text-[11px] ${emphasize ? 'font-bold text-thermal' : 'text-ink-200'}`}>
        {value}
      </span>
    </div>
  );
}

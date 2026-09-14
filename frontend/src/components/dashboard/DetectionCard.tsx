import type { SVGProps } from 'react';
import type { ThermalCluster } from '@/types/cluster';
import { RiskBadge, RISK_TEXT_CLASS } from '@/components/risk/RiskBadge';
import { dashboardClassificationLabel, classificationAccentColor } from '@/lib/classification';
import { classificationIcon } from './icons';
import { coordString, formatRelativeShort, formatTemperature, formatHumidity, formatSmokeLevel } from '@/lib/utils';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StaticMapPreview } from './StaticMapPreview';

interface DetectionCardProps {
  title: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  actionLabel: string;
  cluster: ThermalCluster | null;
  emptyMessage: string;
  onSelectCluster: (clusterId: string) => void;
  /** Seeded preview artwork for this card's map area. */
  previewSrc: string;
}

// Shared presentation for the two Row 3 detection summaries (latest and
// highest-risk). Both show the same fields — Risk Score, Persistence, and
// ESP32 ground-sensor telemetry when a sensor is deployed there — plus a
// seeded map preview (StaticMapPreview). The preview is artwork only; the
// action below it still routes to the real interactive map with this
// cluster selected.
export function DetectionCard({
  title,
  icon: Icon,
  actionLabel,
  cluster,
  emptyMessage,
  onSelectCluster,
  previewSrc,
}: DetectionCardProps) {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <SectionHeader
        label={title}
        icon={Icon}
        right={
          cluster && <span className="font-mono text-[10px] text-white/75">{formatRelativeShort(cluster.timestamp)}</span>
        }
      />
      <div className="flex-1 rounded-xl border border-base-700 bg-base-900 p-3">
        {!cluster ? (
          <div className="flex h-full items-center rounded-lg border border-base-700 bg-base-950 px-4 py-3 text-2xs text-ink-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex h-full flex-col gap-3 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[252px] lg:flex-shrink-0">
              <button type="button" onClick={() => onSelectCluster(cluster.cluster_id)} className="flex items-start gap-2.5 text-left">
                <ClassificationTile classification={cluster.classification} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[13px] font-bold leading-none text-ink-100">{cluster.cluster_id}</span>
                    <RiskBadge level={cluster.risk_level} tone="solid" />
                  </div>
                  <div className="mt-1.5 truncate text-[13px] font-semibold leading-tight text-ink-100">
                    {dashboardClassificationLabel(cluster.classification)}
                  </div>
                  <div className="truncate font-mono text-[11px] leading-tight text-ink-400">{cluster.region}</div>
                  <div className="mt-0.5 truncate font-mono text-[10px] leading-tight text-ink-500">
                    {coordString(cluster.centroid.lat, cluster.centroid.lon)}
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Metric label="Risk Score" value={cluster.risk_score} suffix="/100" valueClass={RISK_TEXT_CLASS[cluster.risk_level]} />
                <Metric label="Persistence" value={cluster.persistence_score} suffix="/100" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Metric label="Temperature" value={formatTemperature(cluster.esp32?.temperature_c)} sub="ESP32" compact />
                <Metric label="Humidity" value={formatHumidity(cluster.esp32?.humidity_pct)} sub="ESP32" compact />
                <Metric label="Smoke Level" value={formatSmokeLevel(cluster.esp32?.smoke_level)} sub="ESP32" compact />
              </div>
            </div>

            <div className="relative min-h-[168px] flex-1 overflow-hidden rounded-lg border border-base-700">
              <StaticMapPreview cluster={cluster} src={previewSrc} />
              <div className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate rounded-md bg-base-900/95 px-2 py-1 font-mono text-[10px] text-ink-200">
                  {cluster.region}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectCluster(cluster.cluster_id)}
                  className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-base-700 bg-base-900 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.06em] text-ink-100 shadow-sm transition-colors hover:bg-base-850"
                >
                  {actionLabel} &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stands in for the reference layout's photo thumbnail. There's no actual
// satellite imagery in the data model, so rather than fabricate a picture
// this uses the same classification color/icon language as Row 2's cards —
// real, data-driven, just not a photo.
function ClassificationTile({ classification }: { classification: ThermalCluster['classification'] }) {
  const color = classificationAccentColor(classification);
  const Icon = classificationIcon(classification);
  return (
    <span
      className="flex h-[62px] w-[62px] flex-shrink-0 items-center justify-center rounded-md bg-accent-dark"
      style={{ color: `${color}` }}
    >
      <Icon className="h-7 w-7" style={{ filter: 'drop-shadow(0 0 6px currentColor)' }} />
    </span>
  );
}

function Metric({
  label,
  value,
  suffix,
  sub,
  valueClass,
  compact,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  sub?: string;
  valueClass?: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-md border border-base-800 bg-base-850 px-2 py-1.5">
      <div className="truncate font-mono text-[9px] uppercase leading-none text-ink-400">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-0.5">
        <span className={`font-mono font-bold leading-none ${compact ? 'text-[16px]' : 'text-[19px]'} ${valueClass ?? 'text-ink-100'}`}>
          {value}
        </span>
        {suffix && <span className="font-mono text-[10px] leading-none text-ink-400">{suffix}</span>}
      </div>
      {sub && <div className="mt-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.06em] text-ink-500">{sub}</div>}
    </div>
  );
}

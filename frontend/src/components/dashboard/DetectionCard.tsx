import type { SVGProps } from 'react';
import type { ThermalCluster } from '@/types/cluster';
import { RiskBadge, RISK_TEXT_CLASS } from '@/components/risk/RiskBadge';
import { dashboardClassificationLabel, classificationAccentColor } from '@/lib/classification';
import { classificationIcon } from './icons';
import { coordString, formatRelativeShort, formatTemperature, formatHumidity, formatSmokeLevel } from '@/lib/utils';

interface DetectionCardProps {
  title: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  cluster: ThermalCluster | null;
  emptyMessage: string;
  onSelectCluster: (clusterId: string) => void;
}

// Shared presentation for the two Row 3 detection summaries (latest and
// highest-risk). Both show the same fields — Risk Score, Persistence, and
// ESP32 ground-sensor telemetry when a sensor is deployed there — so the
// layout is defined once and driven by whichever cluster the caller resolves.
export function DetectionCard({ title, icon: Icon, cluster, emptyMessage, onSelectCluster }: DetectionCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-base-700 bg-base-900 px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-ink-400" />
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">{title}</span>
        </div>
        {cluster && <span className="font-mono text-2xs text-ink-500">{formatRelativeShort(cluster.timestamp)}</span>}
      </div>

      {!cluster ? (
        <div className="flex flex-1 items-center rounded-lg border border-base-700 bg-base-950 px-4 py-3 text-2xs text-ink-500">
          {emptyMessage}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelectCluster(cluster.cluster_id)}
          className="grid flex-1 grid-cols-1 gap-4 text-left lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center lg:gap-5"
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <ClassificationTile classification={cluster.classification} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-ink-100">{cluster.cluster_id}</span>
                <RiskBadge level={cluster.risk_level} />
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-ink-200">
                {dashboardClassificationLabel(cluster.classification)}
              </div>
              <div className="truncate text-xs text-ink-400">{cluster.region}</div>
              <div className="mt-0.5 font-mono text-2xs text-ink-500">
                {coordString(cluster.centroid.lat, cluster.centroid.lon)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Metric label="Risk Score" value={cluster.risk_score} suffix="/100" valueClass={RISK_TEXT_CLASS[cluster.risk_level]} />
            <Metric label="Persistence" value={cluster.persistence_score} suffix="/100" />
            <Metric label="Temperature" value={formatTemperature(cluster.esp32?.temperature_c)} sub="ESP32" />
            <Metric label="Humidity" value={formatHumidity(cluster.esp32?.humidity_pct)} sub="ESP32" />
            <Metric label="Smoke Level" value={formatSmokeLevel(cluster.esp32?.smoke_level)} sub="ESP32" />
          </div>
        </button>
      )}
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
      className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}14`, color }}
    >
      <Icon className="h-7 w-7" />
    </span>
  );
}

function Metric({
  label,
  value,
  suffix,
  sub,
  valueClass,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex min-h-[68px] flex-col items-center justify-center rounded-lg border border-base-700 bg-base-950 px-2 py-2 text-center">
      <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-0.5 font-mono text-sm font-bold ${valueClass ?? 'text-ink-100'}`}>
        {value}
        {suffix && <span className="text-2xs font-normal text-ink-500">{suffix}</span>}
      </div>
      {sub && <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{sub}</div>}
    </div>
  );
}

import type { ThermalCluster } from '@/types/cluster';
import { RiskHighlightCard } from '@/components/risk/RiskHighlightCard';
import { PersistenceHighlightCard } from '@/components/risk/PersistenceHighlightCard';
import { EspTelemetryCard } from './EspTelemetryCard';
import { Section, Row } from '@/components/shared/InfoBlock';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { coordString, formatBrightness, formatFrp, formatPercent, formatUtcDateTime, MISSING_VALUE } from '@/lib/utils';
import { classificationIcon } from '@/components/dashboard/icons';
import { classificationAccentColor } from '@/lib/classification';
import { MapPinIcon, BarChartIcon, StackIcon } from '@/components/dashboard/icons';

interface DetailPanelProps {
  cluster: ThermalCluster;
  onClose: () => void;
}

// Visual hierarchy, most to least prominent: Risk Score -> Risk Level ->
// Risk Reasons -> Persistence (all in the two highlight cards up top),
// then secondary telemetry (classification, geography, FRP/brightness/
// FIRMS confidence/timestamp, adjacent infrastructure) below.
export function DetailPanel({ cluster, onClose }: DetailPanelProps) {
  const ClassIcon = classificationIcon(cluster.classification);
  const classColor = classificationAccentColor(cluster.classification);

  return (
    <aside className="flex h-full w-full flex-col gap-2.5 overflow-y-auto border-l border-base-700 bg-base-950 p-2.5">
      <SectionHeader
        label="Selected target"
        right={
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="rounded border border-white/40 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] text-white transition-colors hover:bg-white/15"
          >
            ESC
          </button>
        }
      />
      <div className="font-mono text-[15px] font-bold leading-none text-ink-100">Cluster {cluster.cluster_id}</div>

      <div className="flex flex-col gap-3.5">
        <RiskHighlightCard cluster={cluster} />
        <PersistenceHighlightCard persistenceScore={cluster.persistence_score} durationHours={cluster.duration_hours} />
        <EspTelemetryCard esp32={cluster.esp32} />

        <Section
          title="AI classification"
          icon={ClassIcon}
          iconStyle={{ color: classColor, backgroundColor: `${classColor}24`, borderColor: `${classColor}59` }}
        >
          <span className="text-[13px] font-semibold text-ink-100">{cluster.classification_label}</span>
        </Section>

        <Section title="Geographic location" icon={MapPinIcon}>
          <Row label="Coordinates" value={coordString(cluster.centroid.lat, cluster.centroid.lon)} />
          <Row label="Region" value={cluster.region ?? MISSING_VALUE} />
        </Section>

        <Section title="Technical telemetry" icon={BarChartIcon}>
          <Row label="Fire Radiative Power (FRP)" value={formatFrp(cluster.frp)} />
          <Row label="Brightness temp (Ch. 21)" value={formatBrightness(cluster.brightness)} />
          <Row label="FIRMS sensor confidence" value={formatPercent(cluster.confidence)} />
          <Row label="Timestamp" value={formatUtcDateTime(cluster.timestamp)} />
        </Section>

        <Section title="Adjacent infrastructure" icon={StackIcon}>
          {cluster.facility ? (
            <>
              <div className="mb-0.5 text-[13px] font-semibold text-ink-100">
                {cluster.facility.name ?? MISSING_VALUE}
              </div>
              <Row label="Facility type" value={cluster.facility.facility_type ?? MISSING_VALUE} />
              <Row label="Est. proximity" value={`${cluster.facility.distance_km.toFixed(1)}km radial`} emphasize />
            </>
          ) : (
            <div className="text-[11px] text-ink-400">No adjacent infrastructure identified within risk radius.</div>
          )}
        </Section>
      </div>
    </aside>
  );
}

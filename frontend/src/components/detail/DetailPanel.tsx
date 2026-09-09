import type { ThermalCluster } from '@/types/cluster';
import { RiskHighlightCard } from '@/components/risk/RiskHighlightCard';
import { PersistenceHighlightCard } from '@/components/risk/PersistenceHighlightCard';
import { Section, Row } from '@/components/shared/InfoBlock';
import { coordString, formatUtcDateTime } from '@/lib/utils';

interface DetailPanelProps {
  cluster: ThermalCluster;
  onClose: () => void;
}

// Visual hierarchy, most to least prominent: Risk Score -> Risk Level ->
// Risk Reasons -> Persistence (all in the two highlight cards up top),
// then secondary telemetry (classification, geography, FRP/brightness/
// FIRMS confidence/timestamp, adjacent infrastructure) below.
export function DetailPanel({ cluster, onClose }: DetailPanelProps) {
  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-l border-base-700 bg-base-950">
      <div className="flex items-center justify-between border-b border-base-700 px-4 py-3">
        <div>
          <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Selected target</div>
          <div className="font-mono text-sm font-bold text-ink-100">Cluster {cluster.cluster_id}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="rounded-sm border border-base-600 px-1.5 py-0.5 font-mono text-2xs text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-100"
        >
          ESC
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <RiskHighlightCard cluster={cluster} />
        <PersistenceHighlightCard persistenceScore={cluster.persistence_score} durationHours={cluster.duration_hours} />

        <Section title="AI classification">
          <span className="text-sm font-semibold text-ink-100">{cluster.classification_label}</span>
        </Section>

        <Section title="Geographic location">
          <Row label="Coordinates" value={coordString(cluster.centroid.lat, cluster.centroid.lon)} />
          <Row label="Region" value={cluster.region} />
        </Section>

        <Section title="Technical telemetry">
          <Row label="Fire Radiative Power (FRP)" value={`${cluster.frp.toFixed(1)} MW`} />
          <Row label="Brightness temp (Ch. 21)" value={`${cluster.brightness.toFixed(1)} K`} />
          <Row label="FIRMS sensor confidence" value={`${cluster.confidence}%`} />
          <Row label="Timestamp" value={formatUtcDateTime(cluster.timestamp)} />
        </Section>

        <Section title="Adjacent infrastructure">
          {cluster.facility ? (
            <>
              <div className="mb-1 text-xs font-semibold text-ink-100">{cluster.facility.name}</div>
              <Row label="Facility type" value={cluster.facility.facility_type} />
              <Row label="Est. proximity" value={`${cluster.facility.distance_km.toFixed(1)}km radial`} emphasize />
            </>
          ) : (
            <div className="text-2xs text-ink-500">No adjacent infrastructure identified within risk radius.</div>
          )}
        </Section>
      </div>
    </aside>
  );
}

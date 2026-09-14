import type { ThermalCluster } from '@/types/cluster';
import seededMapPreview from '@/assets/seeded-map-preview.png';

interface StaticMapPreviewProps {
  cluster: ThermalCluster;
}

/**
 * Seeded, non-interactive preview artwork for the dashboard's detection
 * cards. This is presentation only — it is deliberately NOT derived from
 * the cluster's coordinates, and it does not replace the real interactive
 * basemap. The live MapLibre map still lives on /map (MapView.tsx), which
 * this card's CTA navigates to with the cluster actually selected.
 */
export function StaticMapPreview({ cluster }: StaticMapPreviewProps) {
  return (
    <img
      src={seededMapPreview}
      alt={`Monitoring map preview for cluster ${cluster.cluster_id} in ${cluster.region}`}
      draggable={false}
      className="absolute inset-0 h-full w-full select-none object-cover object-center"
    />
  );
}

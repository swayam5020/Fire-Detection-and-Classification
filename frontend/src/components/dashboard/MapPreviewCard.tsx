import { useNavigate } from 'react-router-dom';
import type { ThermalCluster } from '@/types/cluster';

interface MapPreviewCardProps {
  /** The cluster to highlight on the preview — same one shown in LatestDetection. */
  cluster: ThermalCluster | null;
}

// A lightweight, non-interactive teaser for /map. This intentionally does
// NOT embed MapLibre/MapView — that component is treated as a frozen,
// protected baseline, and instantiating a second live map instance here
// would add real cost (another WebGL context, another world-atlas load)
// for a glorified thumbnail. Instead this renders a dotted "radar grid"
// with a glowing marker positioned via a simple equirectangular projection
// of the real cluster coordinates, reusing the same pulse keyframes as the
// notification bell for visual consistency.
export function MapPreviewCard({ cluster }: MapPreviewCardProps) {
  const navigate = useNavigate();

  const left = cluster ? ((cluster.centroid.lon + 180) / 360) * 100 : 50;
  const top = cluster ? ((90 - cluster.centroid.lat) / 180) * 100 : 50;

  return (
    <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-sm border border-base-700 bg-base-950">
      <div className="map-preview-grid absolute inset-0" />

      <span className="relative z-10 px-5 pt-4 font-mono text-2xs uppercase tracking-wider text-ink-500">
        Monitoring map preview
      </span>

      {cluster && (
        <span
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <span className="absolute inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full bg-thermal" />
          <span className="relative block h-2.5 w-2.5 rounded-full border-2 border-base-950 bg-thermal" />
        </span>
      )}

      <button
        type="button"
        onClick={() => navigate(cluster ? `/map?cluster=${cluster.cluster_id}` : '/map')}
        className="relative z-10 mt-auto self-end m-4 flex items-center gap-2 rounded-sm border border-ink-300 bg-base-950/90 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-100 transition-colors hover:border-ink-100"
      >
        View on Map &rarr;
      </button>
    </div>
  );
}

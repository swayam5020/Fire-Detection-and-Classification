import { useNavigate } from 'react-router-dom';
import type { SVGProps } from 'react';
import type { ThermalCluster } from '@/types/cluster';
import { StaticMapPreview } from './StaticMapPreview';

interface MapPreviewCardProps {
  title: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  actionLabel: string;
  /** The cluster to highlight on the preview. */
  cluster: ThermalCluster | null;
}

// A small teaser for /map, showing real geographic context around the
// cluster via StaticMapPreview (the same offline basemap /map itself uses,
// just non-interactive and at thumbnail size) with the cluster's actual
// region name as a caption — no invented geography, no fabricated imagery.
export function MapPreviewCard({ title, icon: Icon, actionLabel, cluster }: MapPreviewCardProps) {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-xl border border-base-700 bg-base-900">
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-ink-400" />
          <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">{title}</span>
        </div>
      </div>

      <div className="relative mx-4 mt-3 mb-4 flex-1 overflow-hidden rounded-lg border border-base-700 bg-base-800">
        {cluster ? (
          <>
            <StaticMapPreview cluster={cluster} />
            <span className="absolute bottom-2 left-2 z-10 rounded-md bg-base-900/90 px-2 py-1 font-mono text-2xs text-ink-300">
              {cluster.region}
            </span>
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-2xs text-ink-500">
            No detection to preview
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(cluster ? `/map?cluster=${cluster.cluster_id}` : '/map')}
        className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5 rounded-full border border-base-600 bg-base-900 px-3.5 py-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-ink-200 shadow-sm transition-colors hover:border-ink-400 hover:text-ink-100"
      >
        {actionLabel} &rarr;
      </button>
    </div>
  );
}

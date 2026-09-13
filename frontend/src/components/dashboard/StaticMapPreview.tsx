import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { ThermalCluster } from '@/types/cluster';
import { riskDotColor } from '@/components/risk/RiskBadge';
import { loadWorldCountries } from '@/lib/basemap';

interface StaticMapPreviewProps {
  cluster: ThermalCluster;
}

/**
 * A small, non-interactive map centered on a cluster's real coordinates —
 * used by the dashboard's detection preview cards. This reuses the exact
 * same offline vector basemap as the full /map page (lib/basemap.ts's
 * bundled world-atlas country geometry, same dark fill/outline colors),
 * just rendered at thumbnail size with all interaction disabled.
 *
 * This app has no satellite/raster imagery source (no Mapbox/Google/Esri
 * tiles, no API key) — deliberately, per MapView.tsx's own basemap
 * comment — so this is real geographic vector context at the cluster's
 * actual location, not a fabricated photo and not a placeholder gradient.
 */
export function StaticMapPreview({ cluster }: StaticMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      interactive: false,
      attributionControl: false,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b0d10' } }],
      },
      center: [cluster.centroid.lon, cluster.centroid.lat],
      zoom: 5,
    });

    map.on('load', async () => {
      try {
        const countries = await loadWorldCountries();
        map.addSource('countries', { type: 'geojson', data: countries });
        map.addLayer({ id: 'countries-fill', type: 'fill', source: 'countries', paint: { 'fill-color': '#1c2126' } });
        map.addLayer({
          id: 'countries-outline',
          type: 'line',
          source: 'countries',
          paint: { 'line-color': '#343b42', 'line-width': 0.6 },
        });
      } catch {
        // Basemap geometry failed to load — the preview still shows the marker on a plain background.
      }
    });

    const color = riskDotColor(cluster.risk_level);
    const wrapper = document.createElement('span');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'block';
    wrapper.innerHTML = `
      <span class="absolute inline-flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full" style="left:50%;top:50%;background-color:${color}"></span>
      <span class="relative block h-3 w-3 rounded-full border-2 border-white" style="background-color:${color};box-shadow:0 1px 3px rgba(0,0,0,0.5)"></span>
    `;

    const marker = new maplibregl.Marker({ element: wrapper, anchor: 'center' })
      .setLngLat([cluster.centroid.lon, cluster.centroid.lat])
      .addTo(map);

    return () => {
      marker.remove();
      map.remove();
    };
  }, [cluster.cluster_id, cluster.centroid.lat, cluster.centroid.lon, cluster.risk_level]);

  return <div ref={containerRef} className="absolute inset-0" />;
}

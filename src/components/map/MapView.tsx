import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';
import { createRoot, type Root } from 'react-dom/client';
import type { ThermalCluster } from '@/types/cluster';
import { riskDotColor } from '@/components/risk/RiskBadge';
import { HoverCard } from './HoverCard';
import { MapLegend } from './MapLegend';
import { loadWorldCountries } from '@/lib/basemap';

interface MapViewProps {
  clusters: ThermalCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (clusterId: string) => void;
}

const EMPTY_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'bg',
      type: 'background',
      paint: { 'background-color': '#0a0b0d' },
    },
  ],
};

export function MapView({ clusters, selectedClusterId, onSelectCluster }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const popupRef = useRef<Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: EMPTY_STYLE,
      center: [20, 15],
      zoom: 1.6,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('load', async () => {
      try {
        const countries = await loadWorldCountries();
        map.addSource('countries', { type: 'geojson', data: countries });
        map.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'countries',
          paint: { 'fill-color': '#1a1d21' },
        });
        map.addLayer({
          id: 'countries-outline',
          type: 'line',
          source: 'countries',
          paint: { 'line-color': '#2a2d32', 'line-width': 0.6 },
        });
      } catch {
        // Basemap geometry failed to load — the map still functions with
        // markers on a plain dark background.
      }
      setMapReady(true);
    });

    mapRef.current = map;
    const markers = markersRef.current;

    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers whenever the filtered cluster list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const currentIds = new Set(clusters.map((c) => c.cluster_id));

    // Remove markers no longer present.
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    clusters.forEach((cluster) => {
      const existing = markersRef.current.get(cluster.cluster_id);
      const isSelected = cluster.cluster_id === selectedClusterId;

      if (existing) {
        const el = existing.getElement();
        el.style.setProperty('--marker-color', riskDotColor(cluster.risk_level));
        el.classList.toggle('is-selected', isSelected);
        return;
      }

      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('aria-label', `Cluster ${cluster.cluster_id}, ${cluster.risk_level} risk`);
      el.className = 'ts-marker';
      el.style.setProperty('--marker-color', riskDotColor(cluster.risk_level));
      if (isSelected) el.classList.add('is-selected');

      el.addEventListener('mouseenter', () => {
        showHoverPopup(map, popupRef, popupRootRef, cluster);
      });
      el.addEventListener('mouseleave', () => {
        closeHoverPopup(popupRef, popupRootRef);
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectCluster(cluster.cluster_id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([cluster.centroid.lon, cluster.centroid.lat])
        .addTo(map);

      markersRef.current.set(cluster.cluster_id, marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusters, mapReady, selectedClusterId]);

  // Smoothly fly to the selected cluster. Kept as its own effect (rather
  // than folded into marker sync above) so it fires only when the
  // selection itself changes — not on every filter-driven cluster list
  // update — and `clusters` is intentionally left out of the dependency
  // array for the same reason.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedClusterId) return;

    const target = clusters.find((c) => c.cluster_id === selectedClusterId);
    if (!target) return;

    map.flyTo({
      center: [target.centroid.lon, target.centroid.lat],
      zoom: Math.max(map.getZoom(), 4.5),
      speed: 0.9,
      curve: 1.4,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusterId, mapReady]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <MapLegend />
      <style>{`
        .ts-marker {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--marker-color, #d97a2b);
          border: 1.5px solid rgba(10, 11, 13, 0.85);
          cursor: pointer;
          padding: 0;
          box-shadow: 0 0 0 0 rgba(0,0,0,0);
          transition: transform 120ms ease;
        }
        .ts-marker:hover {
          transform: scale(1.4);
        }
        .ts-marker.is-selected {
          box-shadow: 0 0 0 3px rgba(224, 64, 47, 0.35);
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}

function closeHoverPopup(
  popupRef: React.MutableRefObject<Popup | null>,
  popupRootRef: React.MutableRefObject<Root | null>
) {
  popupRef.current?.remove();
  popupRef.current = null;
  // Defer unmount so React doesn't warn about unmounting mid-render.
  const rootToUnmount = popupRootRef.current;
  popupRootRef.current = null;
  if (rootToUnmount) {
    setTimeout(() => rootToUnmount.unmount(), 0);
  }
}

function showHoverPopup(
  map: MapLibreMap,
  popupRef: React.MutableRefObject<Popup | null>,
  popupRootRef: React.MutableRefObject<Root | null>,
  cluster: ThermalCluster
) {
  closeHoverPopup(popupRef, popupRootRef);

  const container = document.createElement('div');
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14 })
    .setLngLat([cluster.centroid.lon, cluster.centroid.lat])
    .setDOMContent(container)
    .addTo(map);

  popupRootRef.current = createRoot(container);
  popupRootRef.current.render(<HoverCard cluster={cluster} />);
  popupRef.current = popup;
}

# PYRON

Frontend for an AI-enabled geospatial system that visualizes satellite-detected
thermal anomalies, industrial fire risk, and persistent industrial thermal
sources. This app **only visualizes** intelligence produced by a backend
pipeline (NASA FIRMS → OSM infrastructure join → persistence + DBSCAN → ML
classification → risk engine → PostGIS → FastAPI). No clustering, ML, or risk
scoring logic lives in this codebase.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- MapLibre GL JS, with an offline world-countries basemap (via `world-atlas` +
  `topojson-client` — no map tile server or API key required)
- React Router

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. The app currently serves realistic mock data from
`src/mock/`, wired through the same service-layer functions the real API will
use — no backend is required to run it.

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

## Connecting the real backend

All data access goes through `src/api/clustersApi.ts` and
`src/api/alertsApi.ts`. Each exposes a small set of async functions
(`fetchClusters`, `fetchClusterById`, `fetchAlerts`, `fetchNotificationState`)
that currently resolve from local mock fixtures.

To connect FastAPI:

1. Set `VITE_API_BASE_URL` (e.g. in a `.env.local` file) to your FastAPI base
   URL.
2. Flip `USE_MOCK = false` at the top of each file in `src/api/`.

No other files need to change — every hook, page, and component consumes
these functions, not the mock data directly.

## Data contract

`src/types/cluster.ts` and `src/types/alert.ts` define the TypeScript shape
the frontend expects from the backend for a thermal cluster and an SOS alert,
respectively (`cluster_id`, `centroid.lat/lon`, `risk_score`, `risk_level`,
`risk_reasons`, `classification`, `frp`, `brightness`, `confidence`,
`persistence_score`, `facility`, etc.). Cluster IDs and centroid coordinates
are always treated as backend-provided — the frontend never computes or
infers them.

## Structure

```
src/
  api/          service layer — swap mock for FastAPI here
  components/
    layout/     header, nav, notification bell
    map/        MapLibre view, hover card, bottom-left control panel (legend + filters)
    filters/    type dropdown, custom date-range picker
    detail/     cluster detail panel, stat strip
    risk/       risk badge / bar / highlight cards
    alerts/     SOS alert list + detail panel (used on /history)
    dashboard/  /dash command-center sections
    states/     loading / empty / error states
  hooks/        useClusters, useAlerts, useNotificationCenter, useClock
  lib/          utils, classification/selection helpers, offline basemap loader
  mock/         fixture data standing in for the backend
  pages/        DashboardPage (/dash), MapPage (/map), AlertsPage (/alert), HistoryPage (/history)
  types/        shared TypeScript contracts with the backend
```

## Routes

- `/dash` — operational overview: situation status, KPIs, risk distribution,
  priority events, classification breakdown, latest detection
- `/map` — full monitoring workspace: map, filters, cluster selection, detail panel
- `/alert` — the single most recent anomaly requiring attention
- `/history` — historical SOS/anomaly record archive

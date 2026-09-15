import type { ThermalCluster } from '@/types/cluster';
import { mockClusters } from '@/mock/clusters';
import { toThermalClusters, type ThermalMapResponse, type BackendErrorResponse } from './adapters';

/**
 * Service layer boundary. Every function here is the single place that
 * knows whether data comes from mock fixtures or a real FastAPI endpoint.
 *
 * Live backend: `ml_model/main.py`, which serves GET /api/thermal-map as a
 * GeoJSON FeatureCollection. The wire format is translated into ThermalCluster
 * by `./adapters` — nothing above this layer knows the backend's field names.
 *
 * Set VITE_USE_MOCK=false in frontend/.env to switch to the live API.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// Mock stays the default so a checkout with no .env still runs.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const NETWORK_DELAY_MS = 550;

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * The backend catches its own exceptions and returns `{"error": "..."}` with a
 * 200 status, so an OK response is not on its own proof of success.
 */
function assertNotBackendError(body: ThermalMapResponse | BackendErrorResponse): asserts body is ThermalMapResponse {
  const err = body as BackendErrorResponse;
  if (err.error || err.status === 'error') {
    throw new Error(`Backend error: ${err.error ?? err.message ?? 'unknown'}`);
  }
}

export async function fetchClusters(): Promise<ThermalCluster[]> {
  if (USE_MOCK) {
    return delay(mockClusters);
  }

  const res = await fetch(`${API_BASE}/api/thermal-map`);
  if (!res.ok) {
    throw new Error(`Failed to fetch clusters: ${res.status}`);
  }

  const body = (await res.json()) as ThermalMapResponse | BackendErrorResponse;
  assertNotBackendError(body);
  return toThermalClusters(body);
}

export async function fetchClusterById(clusterId: string): Promise<ThermalCluster | null> {
  if (USE_MOCK) {
    const found = mockClusters.find((c) => c.cluster_id === clusterId) ?? null;
    return delay(found);
  }

  // The backend exposes no per-cluster route, so this resolves against the
  // collection. Worth replacing with GET /api/thermal-map/{id} if one is added.
  const clusters = await fetchClusters();
  return clusters.find((c) => c.cluster_id === clusterId) ?? null;
}

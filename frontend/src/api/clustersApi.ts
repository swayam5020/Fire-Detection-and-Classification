import type { ThermalCluster } from '@/types/cluster';
import { mockClusters } from '@/mock/clusters';

/**
 * Service layer boundary. Every function here is the single place that
 * knows whether data comes from mock fixtures or a real FastAPI endpoint.
 * Swap the body of these functions for `fetch(`${API_BASE}/clusters`)`
 * calls once the backend is live — nothing above this layer needs to change.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const USE_MOCK = true; // flip to false once FastAPI backend is reachable

const NETWORK_DELAY_MS = 550;

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchClusters(): Promise<ThermalCluster[]> {
  if (USE_MOCK) {
    return delay(mockClusters);
  }

  const res = await fetch(`${API_BASE}/clusters`);
  if (!res.ok) {
    throw new Error(`Failed to fetch clusters: ${res.status}`);
  }
  return res.json();
}

export async function fetchClusterById(clusterId: string): Promise<ThermalCluster | null> {
  if (USE_MOCK) {
    const found = mockClusters.find((c) => c.cluster_id === clusterId) ?? null;
    return delay(found);
  }

  const res = await fetch(`${API_BASE}/clusters/${clusterId}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch cluster ${clusterId}: ${res.status}`);
  }
  return res.json();
}

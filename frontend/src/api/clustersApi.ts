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

// Wokwi ESP32 → Firebase Realtime Database
const ESP32_FIREBASE_URL =
  'https://farmiq-c8afe-default-rtdb.asia-southeast1.firebasedatabase.app/Greenhouse/Live.json';

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * The backend catches its own exceptions and returns `{"error": "..."}` with a
 * 200 status, so an OK response is not on its own proof of success.
 */
function assertNotBackendError(
  body: ThermalMapResponse | BackendErrorResponse,
): asserts body is ThermalMapResponse {
  const err = body as BackendErrorResponse;
  if (err.error || err.status === 'error') {
    throw new Error(`Backend error: ${err.error ?? err.message ?? 'unknown'}`);
  }
}

/**
 * Shape coming from the Wokwi ESP32 Firebase node.
 *
 * The values are intentionally flexible because Firebase may return numbers
 * or numeric strings depending on how the ESP32 writes them.
 */
type Esp32FirebaseData = {
  temperature?: number | string | null;
  humidity?: number | string | null;
  smoke_level?: number | string | null;
};

/**
 * Fetch the latest ESP32 telemetry from Firebase.
 *
 * Temperature and humidity come directly from the Wokwi ESP32.
 * Smoke is kept as a fixed mid-level value for now.
 */
async function fetchEspTelemetry(): Promise<{
  temperature: number | null;
  humidity: number | null;
  smoke_level: number;
}> {
  try {
    const res = await fetch(ESP32_FIREBASE_URL);

    if (!res.ok) {
      throw new Error(`Failed to fetch ESP32 telemetry: ${res.status}`);
    }

    const data = (await res.json()) as Esp32FirebaseData | null;

    const temperature =
      data?.temperature != null ? Number(data.temperature) : null;

    const humidity =
      data?.humidity != null ? Number(data.humidity) : null;

    return {
      temperature: Number.isFinite(temperature) ? temperature : null,
      humidity: Number.isFinite(humidity) ? humidity : null,

      // Fixed mid-level smoke value until the ESP32 smoke sensor is integrated.
      smoke_level: 50,
    };
  } catch (error) {
    console.error('Failed to fetch ESP32 telemetry:', error);

    return {
      temperature: null,
      humidity: null,
      smoke_level: 50,
    };
  }
}

export async function fetchClusters(): Promise<ThermalCluster[]> {
  const esp32 = await fetchEspTelemetry();

  if (USE_MOCK) {
    const clusters = await delay(mockClusters);

    return clusters.map((cluster) => ({
      ...cluster,
      esp32,
    }));
  }

  const res = await fetch(`${API_BASE}/api/thermal-map`);
  if (!res.ok) {
    throw new Error(`Failed to fetch clusters: ${res.status}`);
  }

  const body = (await res.json()) as ThermalMapResponse | BackendErrorResponse;
  assertNotBackendError(body);

  const clusters = toThermalClusters(body);

  return clusters.map((cluster) => ({
    ...cluster,
    esp32,
  }));
}

export async function fetchClusterById(
  clusterId: string,
): Promise<ThermalCluster | null> {
  if (USE_MOCK) {
    const found = mockClusters.find((c) => c.cluster_id === clusterId) ?? null;

    if (!found) {
      return delay(null);
    }

    const esp32 = await fetchEspTelemetry();

    return delay({
      ...found,
      esp32,
    });
  }

  // The backend exposes no per-cluster route, so this resolves against the
  // collection. Worth replacing with GET /api/thermal-map/{id} if one is added.
  const clusters = await fetchClusters();
  return clusters.find((c) => c.cluster_id === clusterId) ?? null;
}
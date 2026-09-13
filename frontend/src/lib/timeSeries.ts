export type BucketGranularity = 'hour' | 'day';

export interface AnomalyCountBucket {
  bucketStart: number; // ms epoch, UTC-aligned
  label: string;
  count: number;
}

export interface AnomalyHistory {
  granularity: BucketGranularity;
  buckets: AnomalyCountBucket[];
}

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * Buckets real alert timestamps into a continuous time series (gaps filled
 * with 0, never skipped) for the /history trend chart. Granularity adapts to
 * how much real history exists — hourly for a span under 48h, daily beyond
 * that — rather than a fixed bucket size that would be too coarse or too
 * noisy depending on how much data has accumulated.
 *
 * Returns null when there's nothing to bucket, so the caller can render an
 * empty state instead of an empty chart.
 */
export function buildAnomalyHistory(timestampsIso: string[]): AnomalyHistory | null {
  if (timestampsIso.length === 0) return null;

  const times = timestampsIso.map((t) => new Date(t).getTime()).sort((a, b) => a - b);
  const min = times[0];
  const max = times[times.length - 1];
  const spanHours = (max - min) / HOUR_MS;

  const granularity: BucketGranularity = spanHours > 48 ? 'day' : 'hour';
  const bucketMs = granularity === 'day' ? DAY_MS : HOUR_MS;
  const bucketStartOf = (t: number) => Math.floor(t / bucketMs) * bucketMs;

  const counts = new Map<number, number>();
  for (const t of times) {
    const key = bucketStartOf(t);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const firstBucket = bucketStartOf(min);
  const lastBucket = bucketStartOf(max);

  const buckets: AnomalyCountBucket[] = [];
  for (let b = firstBucket; b <= lastBucket; b += bucketMs) {
    buckets.push({ bucketStart: b, label: formatBucketLabel(b, granularity), count: counts.get(b) ?? 0 });
  }

  return { granularity, buckets };
}

function formatBucketLabel(ms: number, granularity: BucketGranularity): string {
  const d = new Date(ms);
  if (granularity === 'hour') {
    return `${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} UTC`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

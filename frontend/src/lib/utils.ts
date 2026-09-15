export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatUtcTime(iso: string | null | undefined): string {
  if (iso == null) return MISSING_VALUE;
  const d = new Date(iso);
  return d.toISOString().slice(11, 19) + ' UTC';
}

export function formatUtcDateTime(iso: string | null | undefined): string {
  if (iso == null) return MISSING_VALUE;
  const d = new Date(iso);
  return d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
}

export function formatRelativeShort(iso: string | null | undefined): string {
  if (iso == null) return MISSING_VALUE;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Compares two ISO timestamps, most recent first, with null (no timestamp
 * known) sorted last rather than coerced to epoch 0 — `new Date(null)`
 * silently resolves to 1970-01-01, which would corrupt any recency
 * ordering. Shared by both cluster and alert sorting.
 */
export function compareTimestampsDesc(a: string | null, b: string | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return new Date(b).getTime() - new Date(a).getTime();
}

export function coordString(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}\u00B0 ${latDir}, ${Math.abs(lon).toFixed(4)}\u00B0 ${lonDir}`;
}

export function formatDuration(hours: number | null | undefined): string {
  if (hours == null) return MISSING_VALUE;
  if (hours < 1) return `${Math.round(hours * 60)} minutes continuous`;
  if (hours < 24) return `${Math.round(hours)} hours continuous`;
  return `${(hours / 24).toFixed(1)} days continuous`;
}

export const MISSING_VALUE = '—'; // em dash, used when a reading is unavailable

export function formatFrp(mw: number | null | undefined): string {
  return mw == null ? MISSING_VALUE : `${mw.toFixed(1)} MW`;
}

export function formatBrightness(kelvin: number | null | undefined): string {
  return kelvin == null ? MISSING_VALUE : `${kelvin.toFixed(1)} K`;
}

export function formatPercent(pct: number | null | undefined): string {
  return pct == null ? MISSING_VALUE : `${pct}%`;
}

/** Bare number for the large display readouts, which render their own suffix. */
export function formatScore(value: number | null | undefined): string {
  return value == null ? MISSING_VALUE : String(value);
}

export function formatTemperature(celsius: number | null | undefined): string {
  return celsius == null ? MISSING_VALUE : `${celsius.toFixed(1)}°C`;
}

export function formatHumidity(pct: number | null | undefined): string {
  return pct == null ? MISSING_VALUE : `${pct}%`;
}

export function formatSmokeLevel(level: 'low' | 'medium' | 'high' | null | undefined): string {
  return level == null ? MISSING_VALUE : level.toUpperCase();
}

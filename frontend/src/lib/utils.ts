export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatUtcTime(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(11, 19) + ' UTC';
}

export function formatUtcDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
}

export function formatRelativeShort(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function coordString(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}\u00B0 ${latDir}, ${Math.abs(lon).toFixed(4)}\u00B0 ${lonDir}`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes continuous`;
  if (hours < 24) return `${Math.round(hours)} hours continuous`;
  return `${(hours / 24).toFixed(1)} days continuous`;
}

const MISSING_VALUE = '—'; // em dash, used when a reading is unavailable

export function formatTemperature(celsius: number | null | undefined): string {
  return celsius == null ? MISSING_VALUE : `${celsius.toFixed(1)}°C`;
}

export function formatHumidity(pct: number | null | undefined): string {
  return pct == null ? MISSING_VALUE : `${pct}%`;
}

export function formatSmokeLevel(level: 'low' | 'medium' | 'high' | null | undefined): string {
  return level == null ? MISSING_VALUE : level.toUpperCase();
}

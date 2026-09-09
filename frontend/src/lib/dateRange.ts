export interface DateRange {
  start: string; // 'YYYY-MM-DD'
  end: string; // 'YYYY-MM-DD'
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function startWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

export function formatRangeLabel(range: DateRange | null): string {
  if (!range) return 'Custom';
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(range.start)} \u2013 ${fmt(range.end)}`;
}

/** Whether an ISO cluster timestamp falls within a date range, inclusive of the full end day. */
export function isWithinDateRange(timestampIso: string, range: DateRange): boolean {
  const t = new Date(timestampIso).getTime();
  const startMs = new Date(`${range.start}T00:00:00`).getTime();
  const endMs = new Date(`${range.end}T23:59:59.999`).getTime();
  return t >= startMs && t <= endMs;
}

/** Bounds (in ms since epoch) for a rolling preset window ending now. */
export function presetRangeBounds(preset: '24h' | '7d' | '30d'): { startMs: number; endMs: number } {
  const now = Date.now();
  const hours = preset === '24h' ? 24 : preset === '7d' ? 24 * 7 : 24 * 30;
  return { startMs: now - hours * 3600 * 1000, endMs: now };
}

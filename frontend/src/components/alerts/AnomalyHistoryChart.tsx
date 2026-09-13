import { useMemo, useState } from 'react';
import type { SosAlert } from '@/types/alert';
import { buildAnomalyHistory } from '@/lib/timeSeries';
import { BarChartIcon } from '@/components/dashboard/icons';

interface AnomalyHistoryChartProps {
  /** Same list the table above renders — whatever filter is applied there
   * applies here too, so the chart and the records always agree. */
  alerts: SosAlert[];
}

const LINE_COLOR = '#38bdf8'; // informational blue — distinct from risk semantics
const WIDTH = 800;
const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const MAX_X_TICKS = 7;

interface Point {
  x: number;
  y: number;
}

/**
 * Smooth curve through every point using monotone cubic interpolation
 * (the same family as d3's curveMonotoneX). Unlike a plain Catmull-Rom
 * spline, it never overshoots above a local peak or below a local dip, so
 * a curved read of this zigzagging count data doesn't imply values that
 * were never recorded. Passes through every input point exactly.
 */
function monotoneCubicPath(points: Point[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M ${points[0].x},${points[0].y}`;

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    slope.push((points[i + 1].y - points[i].y) / dx[i]);
  }

  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }

  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = Math.sqrt(a * a + b * b);
    if (h > 3) {
      const t = 3 / h;
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }

  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + dx[i] / 3;
    const cp1y = p0.y + (m[i] * dx[i]) / 3;
    const cp2x = p1.x - dx[i] / 3;
    const cp2y = p1.y - (m[i + 1] * dx[i]) / 3;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
  }
  return d;
}

// A single time-series line chart: real alert counts bucketed over time
// (lib/timeSeries.ts), nothing invented. Subordinate to the table above —
// one series, no legend needed, restrained styling matching the rest of
// the app (rounded card, hairline grid, no gradients/glow).
export function AnomalyHistoryChart({ alerts }: AnomalyHistoryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const history = useMemo(() => buildAnomalyHistory(alerts.map((a) => a.timestamp)), [alerts]);

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 px-6 py-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChartIcon className="h-4 w-4 text-ink-400" />
        <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Thermal Anomaly History</span>
      </div>

      {!history || history.buckets.length < 2 ? (
        <div className="flex h-[160px] items-center justify-center rounded-lg border border-base-700 bg-base-950 px-4 text-center font-mono text-2xs text-ink-500">
          {!history
            ? 'No historical records for this filter.'
            : `Not enough spread yet to chart a trend — ${history.buckets[0]?.count ?? 0} anomal${history.buckets[0]?.count === 1 ? 'y' : 'ies'} recorded at a single point in time.`}
        </div>
      ) : (
        <Chart buckets={history.buckets} hoverIndex={hoverIndex} onHover={setHoverIndex} />
      )}
    </div>
  );
}

function Chart({
  buckets,
  hoverIndex,
  onHover,
}: {
  buckets: { label: string; count: number }[];
  hoverIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const rawMax = Math.max(...buckets.map((b) => b.count));
  const yMax = rawMax <= 4 ? Math.max(rawMax + 1, 2) : Math.ceil(rawMax * 1.2);
  const yTicks = [0, Math.round(yMax / 2), yMax];

  const stepX = buckets.length > 1 ? PLOT_W / (buckets.length - 1) : 0;
  const xAt = (i: number) => PAD.left + i * stepX;
  const yAt = (count: number) => PAD.top + (1 - count / yMax) * PLOT_H;

  const points = buckets.map((b, i) => ({ x: xAt(i), y: yAt(b.count), ...b }));
  const linePath = monotoneCubicPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${PAD.top + PLOT_H} L ${points[0].x.toFixed(1)},${PAD.top + PLOT_H} Z`;

  // Show at most MAX_X_TICKS labels, evenly spaced by index, always including
  // the first and last — but never two ticks closer than half a stride apart,
  // which would otherwise collide right where the strided loop meets the
  // forced last index.
  const xTickStride = Math.max(1, Math.ceil((buckets.length - 1) / (MAX_X_TICKS - 1)));
  const lastIndex = points.length - 1;
  const xTickIndices: number[] = [];
  for (let i = 0; i < points.length; i += xTickStride) xTickIndices.push(i);
  const lastTick = xTickIndices[xTickIndices.length - 1];
  if (lastTick !== lastIndex) {
    if (lastIndex - lastTick < xTickStride / 2) {
      xTickIndices[xTickIndices.length - 1] = lastIndex;
    } else {
      xTickIndices.push(lastIndex);
    }
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    const idx = Math.round((localX - PAD.left) / (stepX || 1));
    onHover(Math.min(Math.max(idx, 0), points.length - 1));
  }

  // Keep the tooltip inside the plot area regardless of which point is hovered.
  const tooltipW = 108;
  const tooltipH = 38;
  let tooltipX = hovered ? hovered.x - tooltipW / 2 : 0;
  tooltipX = Math.min(Math.max(tooltipX, PAD.left), PAD.left + PLOT_W - tooltipW);
  const tooltipAbove = hovered ? hovered.y - PAD.top > tooltipH + 10 : true;
  const tooltipY = hovered ? (tooltipAbove ? hovered.y - tooltipH - 10 : hovered.y + 10) : 0;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      className="block"
      role="img"
      aria-label="Thermal anomaly count over time"
    >
      {/* Y gridlines + labels */}
      {yTicks.map((tick) => {
        const y = yAt(tick);
        return (
          <g key={tick}>
            <line x1={PAD.left} y1={y} x2={PAD.left + PLOT_W} y2={y} stroke="#2a2f36" strokeWidth={1} />
            <text x={PAD.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#666d76">
              {tick}
            </text>
          </g>
        );
      })}

      {/* X axis labels */}
      {xTickIndices.map((i) => (
        <text
          key={i}
          x={points[i].x}
          y={HEIGHT - 8}
          textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
          fontSize={10}
          fill="#666d76"
        >
          {points[i].label}
        </text>
      ))}

      {/* Area wash + line */}
      <path d={areaPath} fill={LINE_COLOR} fillOpacity={0.1} stroke="none" />
      <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* End marker */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={LINE_COLOR} stroke="#15181c" strokeWidth={2} />

      {/* Hover layer */}
      {hovered && (
        <g>
          <line
            x1={hovered.x}
            y1={PAD.top}
            x2={hovered.x}
            y2={PAD.top + PLOT_H}
            stroke="#666d76"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
          <circle cx={hovered.x} cy={hovered.y} r={5} fill={LINE_COLOR} stroke="#15181c" strokeWidth={2} />
          <rect x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH} rx={6} fill="#20242a" stroke="#3a4048" />
          <text x={tooltipX + 10} y={tooltipY + 16} fontSize={12} fontWeight={700} fill="#f1f2f4">
            {hovered.count} anomal{hovered.count === 1 ? 'y' : 'ies'}
          </text>
          <text x={tooltipX + 10} y={tooltipY + 30} fontSize={10} fill="#888e96">
            {hovered.label}
          </text>
        </g>
      )}

      {/* Hover hit area, covers the full plot so the pointer never has to land on the line */}
      <rect
        x={PAD.left}
        y={PAD.top}
        width={PLOT_W}
        height={PLOT_H}
        fill="transparent"
        onMouseMove={handleMove}
        onMouseLeave={() => onHover(null)}
      />
    </svg>
  );
}

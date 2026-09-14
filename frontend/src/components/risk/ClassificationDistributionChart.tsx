import type { ThermalCluster } from '@/types/cluster';
import { SUPPORTED_DASHBOARD_CLASSIFICATIONS, dashboardClassificationLabel, classificationAccentColor } from '@/lib/classification';

interface ClassificationDistributionChartProps {
  activeClusters: ThermalCluster[];
}

const WIDTH = 430;
const HEIGHT = 152;
const PAD = { top: 20, right: 14, bottom: 34, left: 28 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

const GRID = '#D8CFB8';
const AXIS_TEXT = '#446660';

// Two-line wrap for the wider category names, so "Industrial Fire" reads
// the way it does in the reference instead of overflowing its band.
function labelLines(label: string): string[] {
  if (label.length <= 12 || !label.includes(' ')) return [label];
  const cut = label.lastIndexOf(' ');
  return [label.slice(0, cut), label.slice(cut + 1)];
}

// Active-case count per classification, shown as a restrained vertical bar
// chart — reads from the exact same active-cluster data the classification
// cards in Row 2 use, just a different presentation.
export function ClassificationDistributionChart({ activeClusters }: ClassificationDistributionChartProps) {
  const bars = SUPPORTED_DASHBOARD_CLASSIFICATIONS.map((cls) => ({
    cls,
    label: dashboardClassificationLabel(cls),
    count: activeClusters.filter((c) => c.classification === cls).length,
    color: classificationAccentColor(cls),
  }));

  const rawMax = Math.max(...bars.map((b) => b.count));
  const yMax = rawMax <= 3 ? 3 : Math.ceil(rawMax * 1.2);
  const yTicks = yMax <= 6 ? Array.from({ length: yMax + 1 }, (_, i) => i) : [0, Math.round(yMax / 2), yMax];

  const bandW = PLOT_W / bars.length;
  const barW = Math.min(64, bandW * 0.5);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label="Active cases by classification">
      {yTicks.map((tick) => {
        const y = PAD.top + (1 - tick / yMax) * PLOT_H;
        return (
          <g key={tick}>
            <line x1={PAD.left} y1={y} x2={PAD.left + PLOT_W} y2={y} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 7} y={y} textAnchor="end" dominantBaseline="middle" fontSize={12} fill={AXIS_TEXT}>
              {tick}
            </text>
          </g>
        );
      })}

      <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="none" stroke={GRID} strokeWidth={1} />

      {bars.map((b, i) => {
        const cx = PAD.left + i * bandW + bandW / 2;
        const barH = (b.count / yMax) * PLOT_H;
        const y = PAD.top + PLOT_H - barH;
        const lines = labelLines(b.label);
        return (
          <g key={b.cls}>
            {b.count > 0 && <rect x={cx - barW / 2} y={y} width={barW} height={barH} fill={b.color} />}
            <text x={cx} y={y - 7} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0B2A2A">
              {b.count}
            </text>
            {lines.map((line, li) => (
              <text
                key={line}
                x={cx}
                y={PAD.top + PLOT_H + 15 + li * 13}
                textAnchor="middle"
                fontSize={12}
                fill={AXIS_TEXT}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

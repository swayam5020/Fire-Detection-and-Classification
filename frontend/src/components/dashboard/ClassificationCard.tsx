import type { ClassificationType } from '@/types/cluster';
import { FactoryIcon, LeafIcon, TreeIcon } from './icons';

interface ClassificationCardProps {
  classification: ClassificationType;
  label: string;
  totalCount: number;
  activeCount: number;
  onClick: () => void;
}

// Ring color + icon per the three classes /dash currently surfaces
// (SUPPORTED_DASHBOARD_CLASSIFICATIONS). Adding a fourth class later means
// adding one entry here alongside lib/classification.ts, same as before.
const RING_STYLE: Partial<Record<ClassificationType, { color: string; Icon: typeof FactoryIcon }>> = {
  industrial_fire: { color: '#e0402f', Icon: FactoryIcon },
  agricultural_burn: { color: '#d97a2b', Icon: LeafIcon },
  wildfire: { color: '#c9a227', Icon: TreeIcon },
};

export function ClassificationCard({ classification, label, totalCount, activeCount, onClick }: ClassificationCardProps) {
  const style = RING_STYLE[classification] ?? { color: '#6f7278', Icon: FactoryIcon };
  const { color, Icon } = style;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-3 rounded-sm px-2 py-2 text-center transition-colors hover:bg-base-850"
    >
      <span className="font-mono text-2xs font-semibold uppercase tracking-wider text-ink-300">{label}</span>
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full border-2"
        style={{ borderColor: color, color }}
      >
        <Icon className="h-7 w-7" />
      </span>
      <div>
        <div className="font-mono text-2xl font-bold text-ink-100">{activeCount}</div>
        <div className="font-mono text-2xs text-ink-500">active / {totalCount} total</div>
      </div>
    </button>
  );
}

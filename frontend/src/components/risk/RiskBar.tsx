import type { RiskLevel } from '@/types/cluster';
import { riskDotColor } from './RiskBadge';

interface RiskBarProps {
  /** Null when the backend supplied no score — the track renders empty. */
  score: number | null;
  level: RiskLevel;
}

export function RiskBar({ score, level }: RiskBarProps) {
  // An unscored anomaly shows an empty track rather than a full or arbitrary
  // bar, so the absence of a score is never mistaken for a reading of zero.
  const width = score == null ? 0 : Math.max(0, Math.min(100, score));

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${width}%`, backgroundColor: riskDotColor(level) }}
      />
    </div>
  );
}

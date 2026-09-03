import type { RiskLevel } from '@/types/cluster';
import { riskDotColor } from './RiskBadge';

interface RiskBarProps {
  score: number;
  level: RiskLevel;
}

export function RiskBar({ score, level }: RiskBarProps) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-base-700">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, score))}%`, backgroundColor: riskDotColor(level) }}
      />
    </div>
  );
}

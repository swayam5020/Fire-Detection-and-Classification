import type { RiskLevel } from '@/types/cluster';
import { cn } from '@/lib/utils';

const RISK_STYLES: Record<RiskLevel, string> = {
  critical: 'text-risk-critical border-risk-critical/40 bg-risk-critical/10',
  high: 'text-risk-high border-risk-high/40 bg-risk-high/10',
  medium: 'text-risk-medium border-risk-medium/40 bg-risk-medium/10',
  low: 'text-risk-low border-risk-low/40 bg-risk-low/10',
};

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'lg';
  className?: string;
}

export function RiskBadge({ level, size = 'sm', className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border font-mono font-semibold uppercase tracking-wider',
        size === 'lg' ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-2xs',
        RISK_STYLES[level],
        className
      )}
    >
      {level}
    </span>
  );
}

export const RISK_TEXT_CLASS: Record<RiskLevel, string> = {
  critical: 'text-risk-critical',
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};

export function riskDotColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return '#e0402f';
    case 'high':
      return '#d97a2b';
    case 'medium':
      return '#c9a227';
    case 'low':
      return '#4f8a5b';
    default:
      return '#6f7278';
  }
}

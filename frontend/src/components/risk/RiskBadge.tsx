import type { RiskLevel } from '@/types/cluster';
import { cn } from '@/lib/utils';

const RISK_STYLES: Record<RiskLevel, string> = {
  critical: 'text-risk-critical border-risk-critical/40 bg-risk-critical/10',
  high: 'text-risk-high border-risk-high/40 bg-risk-high/10',
  medium: 'text-risk-medium border-risk-medium/40 bg-risk-medium/10',
  low: 'text-risk-low border-risk-low/40 bg-risk-low/10',
};

// Filled variant. Foreground is picked per hue for AA contrast against the
// fill: white only on the dark critical red, primary ink on the lighter
// orange/amber/green.
const RISK_SOLID_STYLES: Record<RiskLevel, string> = {
  critical: 'border-transparent bg-risk-critical text-white',
  high: 'border-transparent bg-risk-high text-ink-100',
  medium: 'border-transparent bg-risk-medium text-ink-100',
  low: 'border-transparent bg-risk-low text-ink-100',
};

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'lg';
  tone?: 'soft' | 'solid';
  className?: string;
}

export function RiskBadge({ level, size = 'sm', tone = 'soft', className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-mono font-bold uppercase tracking-wider',
        size === 'lg' ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-2xs',
        tone === 'solid' ? RISK_SOLID_STYLES[level] : RISK_STYLES[level],
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
      return '#E63946';
    case 'high':
      return '#F97316';
    case 'medium':
      return '#FFBF24';
    case 'low':
      return '#22C55E';
    default:
      return '#446660';
  }
}

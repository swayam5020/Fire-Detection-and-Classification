import type { ThermalCluster, RiskLevel } from '@/types/cluster';

export type SituationLevel = 'normal' | 'elevated' | 'high_risk' | 'critical';

export const SITUATION_LABELS: Record<SituationLevel, string> = {
  normal: 'NORMAL',
  elevated: 'ELEVATED',
  high_risk: 'HIGH RISK',
  critical: 'CRITICAL',
};

interface SituationStyle {
  /** Solid card background. */
  bg: string;
  border: string;
  /** The large level word. */
  title: string;
  /** Supporting count lines, always on the solid background. */
  body: string;
  iconBg: string;
  iconText: string;
}

// A solid, high-contrast status card per level. The `critical` entry is the
// design key's "Status Card (Critical)" spec verbatim (#881E1E background,
// #EF4444 icon on a #FED7D7 tile, white body text); the other three levels
// are the same treatment shifted onto each level's own risk hue, since the
// key only illustrates the critical state.
export const SITUATION_COLOR_CLASSES: Record<SituationLevel, SituationStyle> = {
  normal: {
    bg: 'bg-accent-dark',
    border: 'border-risk-low',
    title: 'text-risk-low',
    body: 'text-white/85',
    iconBg: 'bg-risk-low/25',
    iconText: 'text-risk-low',
  },
  elevated: {
    bg: 'bg-[#713F12]',
    border: 'border-risk-medium',
    title: 'text-risk-medium',
    body: 'text-white/85',
    iconBg: 'bg-risk-medium/25',
    iconText: 'text-risk-medium',
  },
  high_risk: {
    bg: 'bg-[#7C2D12]',
    border: 'border-risk-high',
    title: 'text-risk-high',
    body: 'text-white/85',
    iconBg: 'bg-risk-high/25',
    iconText: 'text-risk-high',
  },
  critical: {
    bg: 'bg-[#881E1E]',
    border: 'border-[#EF4444]',
    title: 'text-[#EF4444]',
    body: 'text-white/85',
    iconBg: 'bg-[#FED7D7]',
    iconText: 'text-[#EF4444]',
  },
};

const LEVEL_TO_SITUATION: Partial<Record<RiskLevel, SituationLevel>> = {
  critical: 'critical',
  high: 'high_risk',
  medium: 'elevated',
};

/**
 * The overall situation is the worst risk level currently active anywhere
 * in the system — critical if any active anomaly is critical, otherwise
 * high risk if any is high, otherwise elevated if any is medium, otherwise
 * normal. Derived entirely from active cluster data, never invented.
 */
export function computeSituationLevel(activeClusters: ThermalCluster[]): SituationLevel {
  for (const cluster of activeClusters) {
    const level = LEVEL_TO_SITUATION[cluster.risk_level];
    if (level === 'critical') return 'critical';
  }
  for (const cluster of activeClusters) {
    if (LEVEL_TO_SITUATION[cluster.risk_level] === 'high_risk') return 'high_risk';
  }
  for (const cluster of activeClusters) {
    if (LEVEL_TO_SITUATION[cluster.risk_level] === 'elevated') return 'elevated';
  }
  return 'normal';
}

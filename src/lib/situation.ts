import type { ThermalCluster, RiskLevel } from '@/types/cluster';

export type SituationLevel = 'normal' | 'elevated' | 'high_risk' | 'critical';

export const SITUATION_LABELS: Record<SituationLevel, string> = {
  normal: 'NORMAL',
  elevated: 'ELEVATED',
  high_risk: 'HIGH RISK',
  critical: 'CRITICAL',
};

// Maps each situation level to the existing risk color language so the
// banner reads consistently with risk badges elsewhere in the app.
export const SITUATION_COLOR_CLASSES: Record<SituationLevel, { text: string; border: string; bg: string }> = {
  normal: { text: 'text-live', border: 'border-live/40', bg: 'bg-live/10' },
  elevated: { text: 'text-risk-medium', border: 'border-risk-medium/40', bg: 'bg-risk-medium/10' },
  high_risk: { text: 'text-risk-high', border: 'border-risk-high/40', bg: 'bg-risk-high/10' },
  critical: { text: 'text-risk-critical', border: 'border-risk-critical/40', bg: 'bg-risk-critical/10' },
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

import type { ThermalCluster, ClassificationType } from '@/types/cluster';
import type { SosAlert } from '@/types/alert';

/**
 * ThermalCluster itself carries no "active" flag — whether an anomaly is
 * currently active is derived from whether it has a live SOS alert. This
 * keeps that derivation in one place so /dash, /map, and /alert never
 * compute it independently.
 */
export function getActiveClusterIds(alerts: SosAlert[]): Set<string> {
  return new Set(alerts.filter((a) => a.status === 'active').map((a) => a.cluster_id));
}

interface HighestRiskOptions {
  classification?: ClassificationType;
  activeClusterIds?: Set<string>;
}

/**
 * Highest-risk cluster matching an optional classification. Prefers a
 * currently-active match; if none of the matching clusters are active,
 * falls back to the highest-risk match overall so a selection is still
 * made rather than coming back empty.
 */
export function selectHighestRiskCluster(
  clusters: ThermalCluster[],
  { classification, activeClusterIds }: HighestRiskOptions = {}
): ThermalCluster | null {
  const matching = classification ? clusters.filter((c) => c.classification === classification) : clusters;
  if (matching.length === 0) return null;

  const byRiskDesc = (a: ThermalCluster, b: ThermalCluster) => b.risk_score - a.risk_score;

  if (activeClusterIds && activeClusterIds.size > 0) {
    const active = matching.filter((c) => activeClusterIds.has(c.cluster_id));
    if (active.length > 0) return [...active].sort(byRiskDesc)[0];
  }

  return [...matching].sort(byRiskDesc)[0];
}

/**
 * The single anomaly /alert leads with: the most recent active alert, or,
 * if none are currently active, the most recently reported alert overall.
 */
export function selectLatestAlert(alerts: SosAlert[]): SosAlert | null {
  if (alerts.length === 0) return null;
  const byRecency = (a: SosAlert, b: SosAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

  const active = alerts.filter((a) => a.status === 'active');
  if (active.length > 0) return [...active].sort(byRecency)[0];

  return [...alerts].sort(byRecency)[0];
}

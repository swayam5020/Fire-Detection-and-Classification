import type { ThermalCluster, ClassificationType } from '@/types/cluster';
import type { SosAlert } from '@/types/alert';
import { compareTimestampsDesc } from './utils';

/**
 * ThermalCluster itself carries no "active" flag — whether an anomaly is
 * currently active is derived from whether it has a live SOS alert. This
 * keeps that derivation in one place so /dash, /map, and /alert never
 * compute it independently.
 */
export function getActiveClusterIds(alerts: SosAlert[]): Set<string> {
  return new Set(alerts.filter((a) => a.status === 'active').map((a) => a.cluster_id));
}

/**
 * Orders by risk score, highest first, with unscored clusters last.
 *
 * A cluster the backend did not score is not "risk zero" — it is unranked.
 * Sorting it to the end keeps the highest-risk-first guarantee for everything
 * that does have a score, without asserting anything about the ones that
 * don't. Shared so /dash, /map, and /active-cases order identically.
 */
export function compareByRiskScoreDesc(a: ThermalCluster, b: ThermalCluster): number {
  if (a.risk_score == null && b.risk_score == null) return 0;
  if (a.risk_score == null) return 1;
  if (b.risk_score == null) return -1;
  return b.risk_score - a.risk_score;
}

/** Most recent detection first; clusters with no timestamp sort last. */
export function compareByTimestampDesc(a: ThermalCluster, b: ThermalCluster): number {
  return compareTimestampsDesc(a.timestamp, b.timestamp);
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

  if (activeClusterIds && activeClusterIds.size > 0) {
    const active = matching.filter((c) => activeClusterIds.has(c.cluster_id));
    if (active.length > 0) return [...active].sort(compareByRiskScoreDesc)[0];
  }

  return [...matching].sort(compareByRiskScoreDesc)[0];
}

/**
 * The single anomaly /alert leads with: the most recent active alert, or,
 * if none are currently active, the most recently reported alert overall.
 */
export function selectLatestAlert(alerts: SosAlert[]): SosAlert | null {
  if (alerts.length === 0) return null;
  const byRecency = (a: SosAlert, b: SosAlert) => compareTimestampsDesc(a.timestamp, b.timestamp);

  const active = alerts.filter((a) => a.status === 'active');
  if (active.length > 0) return [...active].sort(byRecency)[0];

  return [...alerts].sort(byRecency)[0];
}

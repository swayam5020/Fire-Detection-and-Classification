import { useMemo } from 'react';
import type { ThermalCluster } from '@/types/cluster';
import { DetectionCard } from './DetectionCard';
import { FlameIcon } from './icons';
import { getActiveClusterIds, selectHighestRiskCluster } from '@/lib/clusterSelection';
import type { SosAlert } from '@/types/alert';

interface HighestRiskDetectionProps {
  clusters: ThermalCluster[];
  alerts: SosAlert[];
  onSelectCluster: (clusterId: string) => void;
}

// The highest-risk case among currently active anomalies — same selection
// helper /map uses to resolve a classification click, so this never drifts
// from what /map would land on for "highest risk, active".
export function HighestRiskDetection({ clusters, alerts, onSelectCluster }: HighestRiskDetectionProps) {
  const highestRisk = useMemo(() => {
    const activeClusterIds = getActiveClusterIds(alerts);
    return selectHighestRiskCluster(clusters, { activeClusterIds });
  }, [clusters, alerts]);

  return (
    <DetectionCard
      title="Highest risk detection"
      icon={FlameIcon}
      cluster={highestRisk}
      emptyMessage="No detections available."
      onSelectCluster={onSelectCluster}
    />
  );
}

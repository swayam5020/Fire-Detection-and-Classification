import { useMemo } from 'react';
import type { ThermalCluster } from '@/types/cluster';
import { DetectionCard } from './DetectionCard';
import { SignalIcon } from './icons';
import { compareByTimestampDesc } from '@/lib/clusterSelection';
import latestPreview from '@/assets/seeded-map-preview1.png';

interface LatestDetectionProps {
  clusters: ThermalCluster[];
  onSelectCluster: (clusterId: string) => void;
}

export function LatestDetection({ clusters, onSelectCluster }: LatestDetectionProps) {
  const latest = useMemo(() => [...clusters].sort(compareByTimestampDesc)[0] ?? null, [clusters]);

  return (
    <DetectionCard
      title="Latest detection"
      icon={SignalIcon}
      actionLabel="View Latest Detection"
      cluster={latest}
      emptyMessage="No thermal detections available."
      onSelectCluster={onSelectCluster}
      previewSrc={latestPreview}
    />
  );
}

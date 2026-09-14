import type { ClassificationType } from '@/types/cluster';
import { ClassificationCard } from './ClassificationCard';
import { SUPPORTED_DASHBOARD_CLASSIFICATIONS, dashboardClassificationLabel } from '@/lib/classification';
import { SectionHeader } from '@/components/shared/SectionHeader';

interface ClassificationCount {
  total: number;
  active: number;
}

interface ActiveCasesOverviewProps {
  classificationCounts: Map<ClassificationType, ClassificationCount>;
  onSelectClassification: (classification: ClassificationType) => void;
}

// Row 2 of the dashboard: active cases broken down by the classifications
// the model currently produces — the same classificationCounts map /map's
// classification-click selection uses. The aggregate active-case total
// (still real, still computed) now surfaces via the Row 5 donut's center
// figure rather than a duplicate box here, matching the reference layout.
export function ActiveCasesOverview({ classificationCounts, onSelectClassification }: ActiveCasesOverviewProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <SectionHeader label="Cases by classification" />
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-base-700 bg-base-900 p-3 sm:grid-cols-3">
        {SUPPORTED_DASHBOARD_CLASSIFICATIONS.map((cls) => {
          const entry = classificationCounts.get(cls) ?? { total: 0, active: 0 };
          return (
            <ClassificationCard
              key={cls}
              classification={cls}
              label={dashboardClassificationLabel(cls)}
              totalCount={entry.total}
              activeCount={entry.active}
              onClick={() => onSelectClassification(cls)}
            />
          );
        })}
      </div>
    </div>
  );
}

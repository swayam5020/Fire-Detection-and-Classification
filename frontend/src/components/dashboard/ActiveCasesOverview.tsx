import type { ClassificationType } from '@/types/cluster';
import { ClassificationCard } from './ClassificationCard';
import { StackIcon } from './icons';
import { SUPPORTED_DASHBOARD_CLASSIFICATIONS, dashboardClassificationLabel } from '@/lib/classification';

interface ClassificationCount {
  total: number;
  active: number;
}

interface ActiveCasesOverviewProps {
  activeCount: number;
  classificationCounts: Map<ClassificationType, ClassificationCount>;
  onSelectClassification: (classification: ClassificationType) => void;
}

// Row 2 of the dashboard: how many cases are active right now, broken down
// by the classifications the model currently produces. Both numbers are
// derived from the same active-cluster data /map and /alert use — nothing
// here is a separate metric.
export function ActiveCasesOverview({ activeCount, classificationCounts, onSelectClassification }: ActiveCasesOverviewProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-base-700 bg-base-900 px-6 py-5 md:flex-row md:items-center">
      <div className="flex flex-shrink-0 items-center gap-4 md:pr-6">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-base-600 text-ink-300">
          <StackIcon className="h-5.5 w-5.5" />
        </span>
        <div>
          <div className="font-mono text-2xs uppercase tracking-wider text-ink-500">Active cases</div>
          <div className="font-mono text-2xl font-bold text-ink-100">{activeCount}</div>
          <div className="text-2xs text-ink-500">Currently active anomalies</div>
        </div>
      </div>

      <div className="hidden w-px self-stretch bg-base-700 md:block" />

      <div className="min-w-0 flex-1">
        <div className="mb-2.5 font-mono text-2xs uppercase tracking-wider text-ink-500">Cases by classification</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
    </div>
  );
}

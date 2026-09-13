import type { ClassificationType } from '@/types/cluster';

export const CLASSIFICATION_LABELS: Record<ClassificationType, string> = {
  industrial_fire: 'Industrial Fire',
  flare_stack: 'Gas Flare',
  agricultural_burn: 'Agricultural Burning',
  persistent_industrial_source: 'Mining / Industrial Source',
  wildfire: 'Wildfire',
  unknown: 'Other / Unknown',
};

export const ALL_CLASSIFICATIONS: ClassificationType[] = [
  'industrial_fire',
  'flare_stack',
  'agricultural_burn',
  'persistent_industrial_source',
  'wildfire',
  'unknown',
];

/**
 * The classifications the initial model actually produces, and therefore
 * the only ones surfaced in the /dash classification section. This is
 * intentionally separate from ALL_CLASSIFICATIONS (still used by the /map
 * type filter, which reasonably lists every classification the data model
 * supports) — adding a new supported class later means adding one entry
 * here, no page restructuring required.
 */
export const SUPPORTED_DASHBOARD_CLASSIFICATIONS: ClassificationType[] = [
  'industrial_fire',
  'agricultural_burn',
  'wildfire',
];

/**
 * /dash-only label overrides. The shared CLASSIFICATION_LABELS above still
 * says "Agricultural Burning" for the /map type filter and anywhere else
 * classification labels are shown — only dashboard components (the
 * classification cards and cluster summary rows) use the shorter form.
 */
export const DASHBOARD_CLASSIFICATION_LABEL_OVERRIDES: Partial<Record<ClassificationType, string>> = {
  agricultural_burn: 'Agricultural',
};

export function dashboardClassificationLabel(classification: ClassificationType): string {
  return DASHBOARD_CLASSIFICATION_LABEL_OVERRIDES[classification] ?? CLASSIFICATION_LABELS[classification];
}

/**
 * Category color per classification — distinct from risk-level color, used
 * anywhere a classification needs a visual accent (ClassificationCard icon
 * circles, DetectionCard's icon tile). Shared here so the two never drift.
 */
const CLASSIFICATION_ACCENT_COLORS: Partial<Record<ClassificationType, string>> = {
  industrial_fire: '#ef4444',
  agricultural_burn: '#22c55e',
  wildfire: '#3b82f6',
};

export function classificationAccentColor(classification: ClassificationType): string {
  return CLASSIFICATION_ACCENT_COLORS[classification] ?? '#888e96';
}

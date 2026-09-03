import type { SVGProps } from 'react';
import type { ClassificationType } from '@/types/cluster';

// Hand-rolled inline icons, consistent with the rest of the app (Header.tsx
// and NotificationBell.tsx also use raw inline <svg>, not an icon library —
// no new dependency introduced here).

export function FlameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c1.5 1.5 2 3.5 2 5a6 6 0 1 1-12 0c0-4 2-6 3-8 1 1.5 1.5 2.5 1.5 3.5C10.5 8 11 4.5 12 2Z" />
    </svg>
  );
}

export function FactoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M3 21V11l5 3.5V11l5 3.5V9l6 4v8H3Z" />
      <path d="M8 21v-4M13 21v-4M18 21v-4" />
      <path d="M6 11V6M18 9V5" />
    </svg>
  );
}

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M20 4c-9 0-16 5-16 14 9 0 14-5 16-14Z" />
      <path d="M5 19c3-4 6-7 13-13" />
    </svg>
  );
}

export function TreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M12 2 7 10h2.5L6 16h4v6h4v-6h4l-3.5-6H17L12 2Z" />
    </svg>
  );
}

export function WarningTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function CircleQuestionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2 1-1.2 1.8" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function MapFoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/**
 * Classification -> icon, used for the priority-event icon boxes. Purely
 * presentational; does not affect classification logic elsewhere.
 */
export function classificationIcon(classification: ClassificationType) {
  switch (classification) {
    case 'industrial_fire':
      return FactoryIcon;
    case 'flare_stack':
      return FlameIcon;
    case 'persistent_industrial_source':
      return WarningTriangleIcon;
    case 'agricultural_burn':
      return LeafIcon;
    case 'wildfire':
      return TreeIcon;
    default:
      return CircleQuestionIcon;
  }
}

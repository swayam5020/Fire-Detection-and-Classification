import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label: string;
  icon?: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  right?: ReactNode;
  className?: string;
  /** Overrides the label's size/tracking where a page needs a larger title. */
  labelClassName?: string;
}

// The "// LABEL" teal bar every module sits under in this theme. A plain
// rounded rect, not fused to the card body below it — matches the
// reference's treatment of the header as its own distinct strip.
export function SectionHeader({ label, icon: Icon, right, className, labelClassName }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3 rounded-lg bg-accent-header px-3 py-1.5', className)}>
      <div className="flex min-w-0 items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 flex-shrink-0 text-white/85" />}
        <span
          className={cn(
            'truncate font-mono font-bold uppercase leading-none text-white',
            labelClassName ?? 'text-[10px] tracking-[0.12em]'
          )}
        >
          // {label}
        </span>
      </div>
      {right && <div className="flex flex-shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}

import type { CSSProperties, ReactNode, SVGProps } from 'react';

export function Section({
  title,
  icon: Icon,
  iconStyle,
  children,
}: {
  title: string;
  icon?: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  /** Optional tint for the icon tile (used for the classification colour). */
  iconStyle?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      {Icon && (
        <span
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-base-700 bg-base-900 text-ink-400"
          style={iconStyle}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-ink-400">{title}</div>
        {children}
      </div>
    </div>
  );
}

export function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="flex-shrink-0 text-[11px] text-ink-400">{label}:</span>
      <span className={`truncate font-mono text-[11px] ${emphasize ? 'font-bold text-thermal' : 'text-ink-200'}`}>
        {value}
      </span>
    </div>
  );
}

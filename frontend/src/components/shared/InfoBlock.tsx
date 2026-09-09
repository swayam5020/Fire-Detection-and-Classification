import type { ReactNode } from 'react';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-2xs uppercase tracking-wider text-ink-500">{title}</div>
      {children}
    </div>
  );
}

export function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-2xs text-ink-400">{label}:</span>
      <span className={`font-mono text-2xs ${emphasize ? 'font-semibold text-thermal' : 'text-ink-200'}`}>{value}</span>
    </div>
  );
}

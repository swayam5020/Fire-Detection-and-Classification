interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-1 text-ink-500">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-300">{title}</span>
      {description && <span className="max-w-xs text-2xs text-ink-500">{description}</span>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-sm border border-base-600 px-3 py-1 font-mono text-2xs uppercase tracking-wider text-ink-300 transition-colors hover:border-ink-400 hover:text-ink-100"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

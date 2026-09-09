interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-1 text-thermal">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-200">Connection error</span>
      <span className="max-w-xs text-2xs text-ink-500">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-sm border border-thermal/40 px-3 py-1 font-mono text-2xs uppercase tracking-wider text-thermal transition-colors hover:bg-thermal/10"
        >
          Retry
        </button>
      )}
    </div>
  );
}

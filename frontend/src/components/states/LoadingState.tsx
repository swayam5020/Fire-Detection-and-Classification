interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading data' }: LoadingStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink-400">
      <div className="flex gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:400ms]" />
      </div>
      <span className="font-mono text-2xs uppercase tracking-wider">{label}...</span>
    </div>
  );
}

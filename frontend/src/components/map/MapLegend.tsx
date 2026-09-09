export function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-sm border border-base-700 bg-base-950/90 px-3 py-1.5 backdrop-blur-sm">
      <span className="font-mono text-2xs uppercase tracking-wider text-ink-500">Risk status</span>
      <LegendDot color="#e0402f" label="High / Critical" />
      <LegendDot color="#c9a227" label="Medium" />
      <LegendDot color="#4f8a5b" label="Low" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-mono text-2xs text-ink-400">{label}</span>
    </span>
  );
}

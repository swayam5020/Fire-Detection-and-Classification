import { useNavigate } from 'react-router-dom';
import { MapFoldIcon } from './icons';

export function OpenMapWidget() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full items-center justify-between rounded-sm border border-thermal/40 bg-thermal/5 px-5 py-4">
      <div className="flex items-center gap-4">
        <MapFoldIcon className="h-8 w-8 text-thermal" />
        <div>
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-ink-100">Open monitoring map</div>
          <div className="mt-0.5 text-sm text-ink-400">View and investigate thermal anomalies in real-time.</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/map')}
        className="flex-shrink-0 rounded-sm border border-thermal/60 bg-thermal/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-thermal transition-colors hover:bg-thermal/20"
      >
        Open Map &rarr;
      </button>
    </div>
  );
}

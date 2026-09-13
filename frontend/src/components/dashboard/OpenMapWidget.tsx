import { useNavigate } from 'react-router-dom';
import { MapFoldIcon } from './icons';

export function OpenMapWidget() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-base-700 bg-base-900 px-6 py-4">
      <div className="flex items-center gap-3">
        <MapFoldIcon className="h-5 w-5 text-ink-400" />
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-ink-100">Open monitoring map</div>
          <div className="mt-0.5 text-xs text-ink-400">View and investigate every tracked anomaly in real time.</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/map')}
        className="flex-shrink-0 rounded-full border border-base-600 bg-base-900 px-3.5 py-1.5 font-mono text-2xs font-bold uppercase tracking-wider text-ink-200 transition-colors hover:border-ink-400 hover:text-ink-100"
      >
        Open Map &rarr;
      </button>
    </div>
  );
}

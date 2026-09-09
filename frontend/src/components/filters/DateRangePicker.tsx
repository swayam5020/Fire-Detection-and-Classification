import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { daysInMonth, startWeekday, isoDate, type DateRange } from '@/lib/dateRange';

interface DateRangePickerProps {
  value: DateRange | null;
  active: boolean;
  triggerLabel: string;
  onChange: (range: DateRange) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DateRangePicker({ value, active, triggerLabel, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(`${value.end}T00:00:00`) : new Date()));
  const [draftStart, setDraftStart] = useState<string | null>(value?.start ?? null);
  const [draftEnd, setDraftEnd] = useState<string | null>(value?.end ?? null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const numDays = daysInMonth(year, month);
  const leadingBlanks = startWeekday(year, month);
  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: numDays }, (_, i) => isoDate(new Date(year, month, i + 1))),
  ];

  function handlePick(day: string) {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(day);
      setDraftEnd(null);
    } else if (day < draftStart) {
      setDraftStart(day);
      setDraftEnd(null);
    } else {
      setDraftEnd(day);
    }
  }

  function apply() {
    if (draftStart && draftEnd) {
      onChange({ start: draftStart, end: draftEnd });
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'rounded-sm border px-2.5 py-1 font-mono text-2xs uppercase tracking-wider transition-colors',
          active ? 'border-ink-300 text-ink-100' : 'border-base-600 text-ink-500 hover:text-ink-300'
        )}
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-60 rounded-sm border border-base-600 bg-base-900 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              aria-label="Previous month"
              className="px-1 text-ink-400 transition-colors hover:text-ink-100"
            >
              &lsaquo;
            </button>
            <span className="font-mono text-2xs uppercase tracking-wider text-ink-200">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              aria-label="Next month"
              className="px-1 text-ink-400 transition-colors hover:text-ink-100"
            >
              &rsaquo;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAY_LABELS.map((d, i) => (
              <span key={i} className="font-mono text-[10px] text-ink-500">
                {d}
              </span>
            ))}
            {cells.map((day, i) => {
              if (!day) return <span key={i} />;
              const inRange = !!draftStart && !!draftEnd && day >= draftStart && day <= draftEnd;
              const isEdge = day === draftStart || day === draftEnd;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePick(day)}
                  className={cn(
                    'mx-auto flex h-6 w-6 items-center justify-center rounded-sm font-mono text-[10px] transition-colors',
                    isEdge
                      ? 'bg-thermal text-white'
                      : inRange
                        ? 'bg-thermal/20 text-ink-100'
                        : 'text-ink-300 hover:bg-base-700'
                  )}
                >
                  {Number(day.slice(-2))}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-base-700 pt-2">
            <span className="font-mono text-[10px] text-ink-500">
              {draftStart ? `${draftStart}${draftEnd ? ` \u2013 ${draftEnd}` : ''}` : 'Select start date'}
            </span>
            <button
              type="button"
              onClick={apply}
              disabled={!draftStart || !draftEnd}
              className="rounded-sm border border-thermal/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-thermal transition-colors hover:bg-thermal/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

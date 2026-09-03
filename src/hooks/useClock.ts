import { useEffect, useState } from 'react';

/** Current time, refreshed every second — used for the header's live UTC clock. */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export function formatUtcClock(d: Date): string {
  return `${d.toISOString().slice(11, 19)} UTC`;
}

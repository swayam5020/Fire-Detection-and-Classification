import type { Esp32Telemetry } from '@/types/cluster';
import { SensorIcon } from '@/components/dashboard/icons';
import { formatTemperature, formatHumidity, formatSmokeLevel } from '@/lib/utils';

interface EspTelemetryCardProps {
  esp32: Esp32Telemetry | null;
}

// Ground-sensor telemetry, deliberately its own visually distinct card
// (blue accent — never risk-red) rather than a plain info row, so it reads
// immediately as "hardware reading" and isn't missed. Every field renders
// "—" when no ESP32 unit is deployed at a cluster; values only ever come
// from cluster.esp32, never invented here.
export function EspTelemetryCard({ esp32 }: EspTelemetryCardProps) {
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5">
      <div className="mb-3 flex items-center gap-1.5">
        <SensorIcon className="h-4 w-4 text-sky-700" />
        <span className="font-mono text-2xs font-bold uppercase tracking-wider text-sky-700">
          Ground sensor &middot; ESP32
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Temperature" value={formatTemperature(esp32?.temperature_c)} />
        <Stat label="Humidity" value={formatHumidity(esp32?.humidity_pct)} />
        <Stat label="Smoke level" value={formatSmokeLevel(esp32?.smoke_level)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sky-200 bg-white px-2 py-2 text-center">
      <div className="font-mono text-[10px] uppercase tracking-wider text-sky-700/70">{label}</div>
      <div className="mt-0.5 font-mono text-base font-bold text-ink-100">{value}</div>
    </div>
  );
}

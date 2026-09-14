import type { Esp32Telemetry } from '@/types/cluster';
import { SensorIcon } from '@/components/dashboard/icons';
import { formatTemperature, formatHumidity, formatSmokeLevel } from '@/lib/utils';

interface EspTelemetryCardProps {
  esp32: Esp32Telemetry | null;
}

// Ground-sensor telemetry: a labelled section over three inset metric
// tiles, matching the reference's "Sensor Metric" spec (#E8E1C9 tile,
// #0B3D3A value). Every field renders "—" when no ESP32 unit is deployed
// at a cluster; values only ever come from cluster.esp32, never invented
// here, so the tiles are simply ready for real backend readings.
export function EspTelemetryCard({ esp32 }: EspTelemetryCardProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <SensorIcon className="h-3.5 w-3.5 text-ink-400" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-ink-400">
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
    <div className="rounded-md border border-base-700 bg-base-950 px-2 py-2 text-center">
      <div className="font-mono text-[8px] uppercase leading-[1.3] tracking-[0.06em] text-ink-400">{label}</div>
      <div className="mt-1 font-mono text-[17px] font-bold leading-none text-accent-dark">{value}</div>
    </div>
  );
}

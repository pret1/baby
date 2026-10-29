import type { Temperature } from "@/lib/db/schema";
import { TEMPERATURE_SITE_LABELS } from "@/lib/labels";
import { formatCelsius, maxLast24h } from "@/lib/temperatures";
import { formatDuration, formatTime } from "@/lib/time";
import { StatGrid } from "../ui";
import { TemperatureBadge } from "./temperature-badge";

function Tile({ title, temperature, note }: { title: string; temperature: Temperature | null; note: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-2.5">
      <b className="block text-xl leading-tight">
        {temperature ? formatCelsius(temperature.valueCelsius) : "—"}
      </b>
      {temperature && <TemperatureBadge celsius={temperature.valueCelsius} showValue={false} />}
      <span className="block text-xs text-muted">
        {title}
        {temperature && ` · ${note}`}
      </span>
    </div>
  );
}

export function TemperatureStats({ temperatures, now }: { temperatures: Temperature[]; now: Date }) {
  const last = temperatures[0] ?? null;
  const max = maxLast24h(temperatures, now);

  return (
    <StatGrid>
      <Tile
        title="последнее"
        temperature={last}
        note={
          last
            ? `${formatDuration(now.getTime() - last.measuredAt.getTime())} назад · ${TEMPERATURE_SITE_LABELS[last.site].toLowerCase()}`
            : ""
        }
      />
      <Tile
        title="максимум за 24 ч"
        temperature={max}
        note={max ? `в ${formatTime(max.measuredAt)}` : ""}
      />
    </StatGrid>
  );
}

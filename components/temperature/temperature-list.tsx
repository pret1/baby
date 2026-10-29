"use client";

import { deleteTemperature } from "@/lib/actions/temperatures";
import type { Temperature } from "@/lib/db/schema";
import { TEMPERATURE_SITE_LABELS } from "@/lib/labels";
import { formatDayLabel, formatTime, groupByDay } from "@/lib/time";
import { RowActions } from "../row-actions";
import { Card, EmptyState, Tag } from "../ui";
import { TemperatureBadge } from "./temperature-badge";

export function TemperatureList({
  temperatures,
  now,
  onEdit,
}: {
  temperatures: Temperature[];
  now: Date;
  onEdit: (t: Temperature) => void;
}) {
  if (temperatures.length === 0) return <EmptyState>Пока нет измерений</EmptyState>;

  return (
    <Card className="pt-1">
      {groupByDay(temperatures, (t) => t.measuredAt).map((day) => (
        <section key={day.key}>
          <h3 className="mt-3 mb-1 text-[13px] font-bold text-muted">
            {formatDayLabel(day.date, now)}
          </h3>
          <ul>
            {day.items.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-start gap-x-2.5 border-t border-line py-2"
              >
                <time dateTime={t.measuredAt.toISOString()} className="min-w-11 pt-0.5 font-bold">
                  {formatTime(t.measuredAt)}
                </time>
                <div className="min-w-0 flex-1">
                  <TemperatureBadge celsius={t.valueCelsius} />
                  <Tag>{TEMPERATURE_SITE_LABELS[t.site]}</Tag>
                  {t.note && <p className="text-sm break-words text-muted">{t.note}</p>}
                </div>
                <RowActions onEdit={() => onEdit(t)} onDelete={() => deleteTemperature(t.id)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Card>
  );
}

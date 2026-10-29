"use client";

import { useState } from "react";
import { feedingStats, type FeedingPeriod, type FeedingWithInterval } from "@/lib/feedings";
import { BREAST_SIDE_LABELS, FEEDING_TYPE_LABELS } from "@/lib/labels";
import { formatDuration, formatDurationShort, plural } from "@/lib/time";
import { Stat, cn } from "../ui";

const periods: { value: FeedingPeriod; label: string }[] = [
  { value: "today", label: "Сегодня" },
  { value: "24h", label: "24 часа" },
];

function describeFeeding(feeding: FeedingWithInterval): string {
  const type = FEEDING_TYPE_LABELS[feeding.type].toLowerCase();
  if (feeding.breastSide) return `${type} · ${BREAST_SIDE_LABELS[feeding.breastSide].toLowerCase()}`;
  return feeding.volumeMl ? `${type} · ${feeding.volumeMl} мл` : type;
}

export function FeedingStats({ items, now }: { items: FeedingWithInterval[]; now: Date }) {
  const [period, setPeriod] = useState<FeedingPeriod>("today");
  const stats = feedingStats(items, now, period);
  const suffix = period === "today" ? "сегодня" : "за 24 ч";

  return (
    <section aria-label="Статистика кормлений" className="mb-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-muted">Статистика</h2>
        <div className="flex rounded-lg border border-line bg-card p-0.5 text-[13px]">
          {periods.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={period === p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-md px-2.5 py-1 font-semibold",
                period === p.value ? "bg-accent text-white" : "text-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Stat
            value={stats.sinceLastMs === null ? "—" : formatDuration(stats.sinceLastMs)}
            label={
              stats.last
                ? `с начала последнего кормления · ${describeFeeding(stats.last)}`
                : "кормлений ещё не было"
            }
          />
        </div>
        <Stat
          value={stats.count}
          label={`${plural(stats.count, "кормление", "кормления", "кормлений")} ${suffix}`}
        />
        <Stat
          value={stats.totalVolumeMl ? `${stats.totalVolumeMl} мл` : "—"}
          label={`смесь и сцеженное ${suffix}`}
        />
        <Stat
          value={stats.avgIntervalMs === null ? "—" : formatDuration(stats.avgIntervalMs)}
          label={`средний интервал ${suffix}`}
        />
        <Stat
          value={
            stats.minIntervalMs === null || stats.maxIntervalMs === null
              ? "—"
              : `${formatDurationShort(stats.minIntervalMs)} – ${formatDurationShort(stats.maxIntervalMs)}`
          }
          label="мин – макс интервал, ч:мин"
        />
      </div>
    </section>
  );
}

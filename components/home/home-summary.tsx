"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import type { Child, Feeding, Height, Temperature, Weight } from "@/lib/db/schema";
import { feedingStats, withIntervals, type FeedingWithInterval } from "@/lib/feedings";
import { formatCm, formatGrams, formatSigned } from "@/lib/format";
import { heightPoints, heightStats } from "@/lib/heights";
import { BREAST_SIDE_LABELS, FEEDING_TYPE_LABELS } from "@/lib/labels";
import { formatCelsius, maxLast24h } from "@/lib/temperatures";
import { formatDate, formatDuration, formatTime, plural } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { weightPoints, weightStats } from "@/lib/weights";
import { TemperatureBadge } from "../temperature/temperature-badge";
import { Card, Skeleton } from "../ui";

const quickActions = [
  { href: "/feeding", icon: "🍼", label: "Кормление" },
  { href: "/weight", icon: "⚖️", label: "Вес" },
  { href: "/temperature", icon: "🌡️", label: "Температура" },
] as const;

function SummaryCard({ href, title, children }: { href: string; title: string; children: ReactNode }) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-accent">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-bold">{title}</h2>
          <span className="text-muted" aria-hidden>
            ›
          </span>
        </div>
        {children}
      </Card>
    </Link>
  );
}

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="flex justify-between gap-3 py-0.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{children}</span>
    </p>
  );
}

export function HomeSummary({
  child,
  feedings,
  previousFeeding,
  weights,
  heights,
  temperatures,
}: {
  child: Pick<Child, "birthDate" | "birthWeightGrams" | "birthHeightCm">;
  feedings: Feeding[];
  previousFeeding: Feeding | null;
  weights: Weight[];
  heights: Height[];
  temperatures: Temperature[];
}) {
  const now = useNow();
  const feedingItems = useMemo(
    () => withIntervals(feedings, previousFeeding),
    [feedings, previousFeeding],
  );
  const weight = useMemo(() => weightStats(weightPoints(child, weights)), [child, weights]);
  const height = useMemo(() => heightStats(heightPoints(child, heights)), [child, heights]);

  return (
    <>
      <nav aria-label="Быстрое добавление" className="mb-3 grid grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-1 rounded-2xl bg-accent px-1 py-3 text-sm font-bold text-white"
          >
            <span className="text-2xl leading-none" aria-hidden>
              {action.icon}
            </span>
            + {action.label}
          </Link>
        ))}
      </nav>

      {now === null ? (
        <>
          <Skeleton className="mb-3 h-28" />
          <Skeleton className="mb-3 h-24" />
          <Skeleton className="mb-3 h-24" />
          <Skeleton className="h-24" />
        </>
      ) : (
        <>
          <FeedingSummary items={feedingItems} now={new Date(now)} />

          <SummaryCard href="/weight" title="Вес">
            {weight.latest ? (
              <>
                <Line label={`Последний · ${formatDate(weight.latest.measuredAt)}`}>
                  {formatGrams(weight.latest.grams)}
                </Line>
                {weight.sincePrevious && (
                  <Line label="С прошлого взвешивания">
                    {formatSigned(weight.sincePrevious.grams)} г
                  </Line>
                )}
                {weight.sinceBirth && (
                  <Line label="С рождения">{formatSigned(weight.sinceBirth.grams)} г</Line>
                )}
              </>
            ) : (
              <Line label="При рождении">{formatGrams(child.birthWeightGrams)}</Line>
            )}
          </SummaryCard>

          <SummaryCard href="/height" title="Рост">
            {height.latest ? (
              <>
                <Line label={`Последний · ${formatDate(height.latest.measuredAt)}`}>
                  {formatCm(height.latest.cm)}
                </Line>
                {height.sincePrevious && (
                  <Line label="С прошлого измерения">
                    {formatSigned(height.sincePrevious.cm, 1)} см
                  </Line>
                )}
                {height.sinceBirth && (
                  <Line label="С рождения">{formatSigned(height.sinceBirth.cm, 1)} см</Line>
                )}
              </>
            ) : child.birthHeightCm !== null ? (
              <Line label="При рождении">{formatCm(child.birthHeightCm)}</Line>
            ) : (
              <p className="text-sm text-muted">Измерений пока не было</p>
            )}
          </SummaryCard>

          <TemperatureSummary temperatures={temperatures} now={new Date(now)} />
        </>
      )}
    </>
  );
}

function FeedingSummary({ items, now }: { items: FeedingWithInterval[]; now: Date }) {
  const stats = feedingStats(items, now, "today");
  const last = stats.last;

  return (
    <SummaryCard href="/feeding" title="Кормление">
      {last ? (
        <>
          <p className="text-2xl font-bold">{formatDuration(stats.sinceLastMs ?? 0)}</p>
          <p className="mb-1 text-xs text-muted">
            с начала последнего кормления в {formatTime(last.startedAt)} ·{" "}
            {FEEDING_TYPE_LABELS[last.type].toLowerCase()}
            {last.breastSide && ` · ${BREAST_SIDE_LABELS[last.breastSide].toLowerCase()}`}
          </p>
          <Line label="Сегодня">
            {stats.count} {plural(stats.count, "кормление", "кормления", "кормлений")}
            {stats.totalVolumeMl > 0 && ` · ${stats.totalVolumeMl} мл`}
          </Line>
          {stats.avgIntervalMs !== null && (
            <Line label="Средний интервал сегодня">{formatDuration(stats.avgIntervalMs)}</Line>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">Кормлений пока не было</p>
      )}
    </SummaryCard>
  );
}

function TemperatureSummary({ temperatures, now }: { temperatures: Temperature[]; now: Date }) {
  const last = temperatures[0];
  const max = maxLast24h(temperatures, now);

  return (
    <SummaryCard href="/temperature" title="Температура">
      {last ? (
        <>
          <Line label={`Последняя · ${formatDuration(now.getTime() - last.measuredAt.getTime())} назад`}>
            {formatCelsius(last.valueCelsius)}
          </Line>
          {max ? (
            <div className="flex items-center justify-between gap-3 py-0.5 text-sm">
              <span className="text-muted">Максимум за 24 ч</span>
              <TemperatureBadge celsius={max.valueCelsius} />
            </div>
          ) : (
            <Line label="За 24 ч">измерений не было</Line>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">Измерений пока не было</p>
      )}
    </SummaryCard>
  );
}

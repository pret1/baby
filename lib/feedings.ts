import type { Feeding } from "./db/schema";
import { DAY, startOfDay } from "./time";

export type FeedingWithInterval = Feeding & {
  /** Время от начала предыдущего кормления до начала этого, мс; null — предыдущего нет. */
  intervalMs: number | null;
};

/**
 * Интервал = начало текущего кормления минус начало предыдущего.
 * Считаем по абсолютным меткам времени в хронологическом порядке, поэтому
 * переход через полночь (и через границу дней в списке) ничем не отличается
 * от любого другого. `previous` — последнее кормление до загруженного окна.
 * Возвращает записи от новых к старым.
 */
export function withIntervals(
  feedings: Feeding[],
  previous: Feeding | null,
): FeedingWithInterval[] {
  const chronological = [...feedings].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
  );
  let prevStart = previous ? previous.startedAt.getTime() : null;
  const result = chronological.map((feeding) => {
    const start = feeding.startedAt.getTime();
    const intervalMs = prevStart === null ? null : start - prevStart;
    prevStart = start;
    return { ...feeding, intervalMs };
  });
  return result.reverse();
}

export type FeedingPeriod = "today" | "24h";

export type FeedingStats = {
  last: FeedingWithInterval | null;
  sinceLastMs: number | null;
  count: number;
  avgIntervalMs: number | null;
  minIntervalMs: number | null;
  maxIntervalMs: number | null;
  totalVolumeMl: number;
};

/**
 * Статистика за период: «сегодня» — с полуночи по времени телефона,
 * «24 ч» — скользящее окно от текущего момента.
 * Интервал относится к кормлению, которым он заканчивается: если кормление попало
 * в период, его интервал учитывается, даже если предыдущее было раньше начала периода.
 */
export function feedingStats(
  items: FeedingWithInterval[],
  now: Date,
  period: FeedingPeriod,
): FeedingStats {
  const from = period === "today" ? startOfDay(now).getTime() : now.getTime() - DAY;
  const inPeriod = items.filter((f) => f.startedAt.getTime() >= from);
  const intervals = inPeriod.flatMap((f) => (f.intervalMs === null ? [] : [f.intervalMs]));
  const last = items[0] ?? null;

  return {
    last,
    sinceLastMs: last ? Math.max(0, now.getTime() - last.startedAt.getTime()) : null,
    count: inPeriod.length,
    avgIntervalMs: intervals.length
      ? intervals.reduce((sum, ms) => sum + ms, 0) / intervals.length
      : null,
    minIntervalMs: intervals.length ? Math.min(...intervals) : null,
    maxIntervalMs: intervals.length ? Math.max(...intervals) : null,
    totalVolumeMl: inPeriod.reduce((sum, f) => sum + (f.volumeMl ?? 0), 0),
  };
}

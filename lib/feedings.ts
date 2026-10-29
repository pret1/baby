import type { Feeding } from "./db/schema";

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

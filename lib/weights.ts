import type { Child, Weight } from "./db/schema";
import { DAY } from "./time";

/** Точка на графике/в истории. `weight === null` — вес при рождении из профиля. */
export type WeightPoint = {
  measuredAt: Date;
  grams: number;
  weight: Weight | null;
};

export type WeightChange = {
  grams: number;
  days: number;
  /** Прирост в сутки; null, если между взвешиваниями меньше суток. */
  gramsPerDay: number | null;
};

export type WeightRow = WeightPoint & { change: WeightChange | null };

/** Вес при рождении — первая точка, дальше взвешивания по времени. */
export function weightPoints(
  child: Pick<Child, "birthDate" | "birthWeightGrams">,
  weights: Weight[],
): WeightPoint[] {
  const points: WeightPoint[] = [
    { measuredAt: child.birthDate, grams: child.birthWeightGrams, weight: null },
    ...weights.map((w) => ({ measuredAt: w.measuredAt, grams: w.weightGrams, weight: w })),
  ];
  return points.sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
}

/**
 * Изменение между двумя точками. Прирост в сутки считаем только если прошло
 * не меньше суток: взвешивания «до» и «после» кормления с разницей в полчаса
 * дали бы бессмысленные сотни граммов в сутки.
 */
export function weightChange(from: WeightPoint, to: WeightPoint): WeightChange {
  const grams = to.grams - from.grams;
  const days = (to.measuredAt.getTime() - from.measuredAt.getTime()) / DAY;
  return { grams, days, gramsPerDay: days >= 1 ? grams / days : null };
}

/** История от новых к старым, у каждой записи — изменение относительно предыдущей. */
export function weightRows(points: WeightPoint[]): WeightRow[] {
  return points
    .map((point, i) => ({
      ...point,
      change: i > 0 ? weightChange(points[i - 1], point) : null,
    }))
    .reverse();
}

export function weightStats(points: WeightPoint[]) {
  const latestIndex = points.findLastIndex((p) => p.weight !== null);
  if (latestIndex === -1) return { latest: null, sincePrevious: null, sinceBirth: null };
  const latest = points[latestIndex];
  const birth = points.find((p) => p.weight === null);
  return {
    latest,
    sincePrevious: latestIndex > 0 ? weightChange(points[latestIndex - 1], latest) : null,
    sinceBirth: birth ? weightChange(birth, latest) : null,
  };
}

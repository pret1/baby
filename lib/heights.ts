import type { Child, Height } from "./db/schema";
import { DAY } from "./time";

/** Точка на графике/в истории. `height === null` — рост при рождении из профиля. */
export type HeightPoint = {
  measuredAt: Date;
  cm: number;
  height: Height | null;
};

export type HeightChange = {
  cm: number;
  days: number;
  /** Прирост в месяц; null, если между измерениями меньше двух недель. */
  cmPerMonth: number | null;
};

export type HeightRow = HeightPoint & { change: HeightChange | null };

/** Средняя длина месяца в днях (365,25 / 12). */
const MONTH_DAYS = 30.4375;
const MIN_DAYS_FOR_RATE = 14;

/** Рост при рождении (если указан в профиле) — первая точка, дальше измерения по времени. */
export function heightPoints(
  child: Pick<Child, "birthDate" | "birthHeightCm">,
  heights: Height[],
): HeightPoint[] {
  const points: HeightPoint[] = heights.map((h) => ({
    measuredAt: h.measuredAt,
    cm: h.heightCm,
    height: h,
  }));
  if (child.birthHeightCm !== null) {
    points.push({ measuredAt: child.birthDate, cm: child.birthHeightCm, height: null });
  }
  return points.sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
}

/**
 * Изменение между двумя точками. Рост младенцев принято считать в сантиметрах
 * в месяц. Скорость показываем, только если прошло не меньше двух недель:
 * погрешность измерения ±0,5–1 см за несколько дней дала бы бессмысленные
 * «+5 см/мес».
 */
export function heightChange(from: HeightPoint, to: HeightPoint): HeightChange {
  const cm = to.cm - from.cm;
  const days = (to.measuredAt.getTime() - from.measuredAt.getTime()) / DAY;
  return { cm, days, cmPerMonth: days >= MIN_DAYS_FOR_RATE ? (cm / days) * MONTH_DAYS : null };
}

/** История от новых к старым, у каждой записи — изменение относительно предыдущей. */
export function heightRows(points: HeightPoint[]): HeightRow[] {
  return points
    .map((point, i) => ({
      ...point,
      change: i > 0 ? heightChange(points[i - 1], point) : null,
    }))
    .reverse();
}

export function heightStats(points: HeightPoint[]) {
  const latestIndex = points.findLastIndex((p) => p.height !== null);
  if (latestIndex === -1) return { latest: null, sincePrevious: null, sinceBirth: null };
  const latest = points[latestIndex];
  const birth = points.find((p) => p.height === null);
  return {
    latest,
    sincePrevious: latestIndex > 0 ? heightChange(points[latestIndex - 1], latest) : null,
    sinceBirth: birth ? heightChange(birth, latest) : null,
  };
}

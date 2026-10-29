import type { Temperature } from "./db/schema";
import { DAY } from "./time";

export type TemperatureLevel = "low" | "normal" | "elevated" | "high";

/** Пороги из ТЗ: < 36 — понижена, ≥ 37,5 — повышена, ≥ 38 — высокая. */
export function temperatureLevel(celsius: number): TemperatureLevel {
  if (celsius >= 38) return "high";
  if (celsius >= 37.5) return "elevated";
  if (celsius < 36) return "low";
  return "normal";
}

export const TEMPERATURE_LEVEL_LABELS: Record<TemperatureLevel, string> = {
  low: "понижена",
  normal: "норма",
  elevated: "повышена",
  high: "высокая",
};

/** Максимальное измерение за последние 24 часа (при равенстве — самое свежее). */
export function maxLast24h(temperatures: Temperature[], now: Date): Temperature | null {
  const from = now.getTime() - DAY;
  let max: Temperature | null = null;
  for (const t of temperatures) {
    if (t.measuredAt.getTime() < from) continue;
    const better =
      !max ||
      t.valueCelsius > max.valueCelsius ||
      (t.valueCelsius === max.valueCelsius && t.measuredAt > max.measuredAt);
    if (better) max = t;
  }
  return max;
}

export function formatCelsius(celsius: number): string {
  return `${celsius.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} °C`;
}

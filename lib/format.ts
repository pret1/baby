import { plural } from "./time";

export function formatGrams(grams: number): string {
  return `${grams.toLocaleString("ru-RU")} г`;
}

/** «+120», «−80» (настоящий минус), «0». */
export function formatSigned(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded.toLocaleString("ru-RU")}`;
  if (rounded < 0) return `−${Math.abs(rounded).toLocaleString("ru-RU")}`;
  return "0";
}

/** «за 5 ч», «за 2 дня». */
export function formatPeriod(days: number): string {
  if (days < 1) return `за ${Math.max(1, Math.round(days * 24))} ч`;
  const rounded = Math.round(days);
  return `за ${rounded} ${plural(rounded, "день", "дня", "дней")}`;
}

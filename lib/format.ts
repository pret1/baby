import { plural } from "./time";

export function formatGrams(grams: number): string {
  return `${grams.toLocaleString("ru-RU")} г`;
}

/** «+120», «−80» (настоящий минус), «0»; с `fractionDigits` = 1 — «+2,5», «+3». */
export function formatSigned(value: number, fractionDigits = 0): string {
  const factor = 10 ** fractionDigits;
  const rounded = Math.round(value * factor) / factor;
  const abs = Math.abs(rounded).toLocaleString("ru-RU", { maximumFractionDigits: fractionDigits });
  if (rounded > 0) return `+${abs}`;
  if (rounded < 0) return `−${abs}`;
  return "0";
}

/** «52 см», «54,5 см». */
export function formatCm(cm: number): string {
  return `${cm.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} см`;
}

/** «за 5 ч», «за 2 дня». */
export function formatPeriod(days: number): string {
  if (days < 1) return `за ${Math.max(1, Math.round(days * 24))} ч`;
  const rounded = Math.round(days);
  return `за ${rounded} ${plural(rounded, "день", "дня", "дней")}`;
}

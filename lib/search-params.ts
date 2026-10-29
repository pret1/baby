const DEFAULT_DAYS = 30;
const MAX_DAYS = 3650;

/** `?days=N` — за сколько дней показывать историю (кнопка «Показать ещё»). */
export function parseDays(value: string | string[] | undefined): number {
  const days = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(days) || days < DEFAULT_DAYS) return DEFAULT_DAYS;
  return Math.min(days, MAX_DAYS);
}

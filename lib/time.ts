// Форматирование дат и длительностей. Результат зависит от часового пояса,
// поэтому всё, что показывает время, рендерится только на клиенте (см. useNow).

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const pluralRules = new Intl.PluralRules("ru-RU");

export function plural(n: number, one: string, few: string, many: string): string {
  switch (pluralRules.select(n)) {
    case "one":
      return one;
    case "few":
      return few;
    default:
      return many;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Date → значение для `<input type="datetime-local">` в локальном времени телефона. */
export function toLocalInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Строка без часового пояса из datetime-local по стандарту трактуется как локальное время. */
export function fromLocalInput(value: string): Date {
  return new Date(value);
}

export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/** «45 мин», «2 ч 05 мин», «3 д 4 ч». */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / MINUTE));
  if (totalMin < 60) return `${totalMin} мин`;
  const hours = Math.floor(totalMin / 60);
  if (hours < 24) return `${hours} ч ${pad(totalMin % 60)} мин`;
  return `${Math.floor(hours / 24)} д ${hours % 24} ч`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Ключ календарного дня в часовом поясе телефона. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function formatDayLabel(date: Date, now: Date): string {
  const key = dayKey(date);
  if (key === dayKey(now)) return "Сегодня";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === dayKey(yesterday)) return "Вчера";
  const label = date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Прибавляет месяцы; 31 января + 1 месяц = 28/29 февраля, а не 3 марта. */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function joinParts(...parts: (string | false)[]): string {
  return parts.filter(Boolean).join(" ");
}

const days = (n: number) => n > 0 && `${n} ${plural(n, "день", "дня", "дней")}`;
const months = (n: number) => n > 0 && `${n} ${plural(n, "месяц", "месяца", "месяцев")}`;

/**
 * Возраст: до 4 недель — в днях, до ~3 месяцев — в неделях и днях,
 * дальше — в календарных месяцах (и годах) и днях.
 */
export function formatAge(birth: Date, now: Date): string {
  const ms = now.getTime() - birth.getTime();
  if (ms < 0) return "";
  const totalDays = Math.floor(ms / DAY);

  if (totalDays < 1) {
    const hours = Math.floor(ms / HOUR);
    return `${hours} ${plural(hours, "час", "часа", "часов")}`;
  }
  if (totalDays < 28) return joinParts(days(totalDays));
  if (totalDays < 91) {
    const weeks = Math.floor(totalDays / 7);
    return joinParts(`${weeks} ${plural(weeks, "неделя", "недели", "недель")}`, days(totalDays % 7));
  }

  let fullMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (addMonths(birth, fullMonths) > now) fullMonths -= 1;
  const restDays = Math.floor((now.getTime() - addMonths(birth, fullMonths).getTime()) / DAY);

  if (fullMonths < 12) return joinParts(months(fullMonths), days(restDays));
  const years = Math.floor(fullMonths / 12);
  return joinParts(`${years} ${plural(years, "год", "года", "лет")}`, months(fullMonths % 12));
}

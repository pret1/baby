import { describe, expect, it } from "vitest";
import { HOUR, MINUTE, formatAge, formatDuration } from "./time";

const at = (month: number, day: number, hours = 12, year = 2026) =>
  new Date(year, month - 1, day, hours);

describe("formatAge", () => {
  const now = at(10, 29, 13);

  it.each([
    [at(10, 29, 8), "5 часов"],
    [at(10, 28, 12), "1 день"],
    [at(10, 26, 12), "3 дня"],
    [at(10, 19, 8), "10 дней"],
    [at(10, 8, 12), "21 день"],
    [at(10, 1, 12), "4 недели"],
    [at(9, 14, 12), "6 недель 3 дня"],
    [at(5, 31, 10), "4 месяца 29 дней"],
    [at(6, 15, 12, 2025), "1 год 4 месяца"],
  ])("%s → %s", (birth, expected) => {
    expect(formatAge(birth, now)).toBe(expected);
  });

  it("дата рождения в будущем — пусто", () => {
    expect(formatAge(at(10, 30), now)).toBe("");
  });
});

describe("formatDuration", () => {
  it.each([
    [45 * MINUTE, "45 мин"],
    [2 * HOUR + 5 * MINUTE, "2 ч 05 мин"],
    [27 * HOUR, "1 д 3 ч"],
  ])("%d мс → %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});

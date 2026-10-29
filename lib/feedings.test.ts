import { describe, expect, it } from "vitest";
import type { Feeding } from "./db/schema";
import { feedingStats, withIntervals } from "./feedings";
import { HOUR, MINUTE } from "./time";

// Даты задаются в локальном времени — тесты не зависят от часового пояса машины.
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 9, day, hours, minutes);

let seq = 0;
function feeding(startedAt: Date, extra: Partial<Feeding> = {}): Feeding {
  seq += 1;
  return {
    id: `f${seq}`,
    childId: "child",
    startedAt,
    type: "breast",
    breastSide: "left",
    volumeMl: null,
    durationMin: null,
    note: null,
    createdAt: startedAt,
    updatedAt: startedAt,
    ...extra,
  };
}

const formula = (volumeMl: number) => ({ type: "formula" as const, breastSide: null, volumeMl });

describe("withIntervals", () => {
  it("считает интервал от начала предыдущего кормления, в том числе через полночь", () => {
    const items = withIntervals(
      [feeding(at(28, 23, 30)), feeding(at(29, 2, 15)), feeding(at(28, 20, 0))],
      null,
    );
    expect(items.map((f) => f.startedAt)).toEqual([at(29, 2, 15), at(28, 23, 30), at(28, 20, 0)]);
    expect(items.map((f) => f.intervalMs)).toEqual([
      2 * HOUR + 45 * MINUTE,
      3 * HOUR + 30 * MINUTE,
      null,
    ]);
  });

  it("для самой старой записи берёт кормление перед загруженным окном", () => {
    const items = withIntervals([feeding(at(28, 20, 0))], feeding(at(27, 22, 0)));
    expect(items[0].intervalMs).toBe(22 * HOUR);
  });
});

describe("feedingStats", () => {
  const now = at(29, 10, 0);
  const items = withIntervals(
    [
      feeding(at(28, 9, 0), formula(60)), // больше суток назад
      feeding(at(28, 21, 0), formula(90)), // вчера, но в пределах 24 ч
      feeding(at(29, 0, 30)),
      feeding(at(29, 3, 30), { type: "pumped", breastSide: null, volumeMl: 80 }),
      feeding(at(29, 8, 0)),
    ],
    null,
  );

  it("«сегодня» — с полуночи по местному времени", () => {
    const stats = feedingStats(items, now, "today");
    expect(stats.count).toBe(3);
    // Интервал 00:30 считается от вчерашнего 21:00 — кормление попало в «сегодня».
    expect(stats.minIntervalMs).toBe(3 * HOUR);
    expect(stats.maxIntervalMs).toBe(4.5 * HOUR);
    expect(stats.avgIntervalMs).toBe(((3.5 + 3 + 4.5) / 3) * HOUR);
    expect(stats.totalVolumeMl).toBe(80);
    expect(stats.sinceLastMs).toBe(2 * HOUR);
    expect(stats.last?.startedAt).toEqual(at(29, 8, 0));
  });

  it("«24 ч» — скользящее окно от текущего момента", () => {
    const stats = feedingStats(items, now, "24h");
    expect(stats.count).toBe(4);
    expect(stats.maxIntervalMs).toBe(12 * HOUR);
    expect(stats.totalVolumeMl).toBe(170);
  });

  it("без кормлений", () => {
    const stats = feedingStats([], now, "today");
    expect(stats).toMatchObject({
      last: null,
      sinceLastMs: null,
      count: 0,
      avgIntervalMs: null,
      totalVolumeMl: 0,
    });
  });
});

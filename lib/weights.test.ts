import { describe, expect, it } from "vitest";
import type { Weight } from "./db/schema";
import { weightPoints, weightRows, weightStats } from "./weights";

const at = (day: number, hours = 10, minutes = 0) => new Date(2026, 9, day, hours, minutes);

let seq = 0;
function weight(measuredAt: Date, weightGrams: number): Weight {
  seq += 1;
  return {
    id: `w${seq}`,
    childId: "child",
    measuredAt,
    weightGrams,
    beforeFeeding: false,
    afterFeeding: false,
    freshDiaper: false,
    note: null,
    createdAt: measuredAt,
    updatedAt: measuredAt,
  };
}

const child = { birthDate: at(19, 8), birthWeightGrams: 3400 };

describe("weightPoints", () => {
  it("ставит вес при рождении первой точкой", () => {
    const points = weightPoints(child, [weight(at(25), 3300), weight(at(22), 3250)]);
    expect(points.map((p) => p.grams)).toEqual([3400, 3250, 3300]);
    expect(points[0].weight).toBeNull();
  });
});

describe("weightStats", () => {
  it("без взвешиваний — пусто", () => {
    expect(weightStats(weightPoints(child, []))).toEqual({
      latest: null,
      sincePrevious: null,
      sinceBirth: null,
    });
  });

  it("изменение с прошлого взвешивания и с рождения, прирост в сутки", () => {
    const stats = weightStats(
      weightPoints(child, [weight(at(25, 10), 3300), weight(at(29, 10), 3500)]),
    );
    expect(stats.latest?.grams).toBe(3500);
    expect(stats.sincePrevious).toMatchObject({ grams: 200, days: 4, gramsPerDay: 50 });
    expect(stats.sinceBirth?.grams).toBe(100);
  });

  it("прирост в сутки не считается, если прошло меньше суток", () => {
    const stats = weightStats(
      weightPoints(child, [weight(at(29, 10, 0), 3500), weight(at(29, 10, 40), 3590)]),
    );
    expect(stats.sincePrevious?.grams).toBe(90);
    expect(stats.sincePrevious?.gramsPerDay).toBeNull();
  });
});

describe("weightRows", () => {
  it("история от новых к старым с изменением к предыдущей точке", () => {
    const rows = weightRows(weightPoints(child, [weight(at(21, 8), 3200)]));
    expect(rows.map((r) => r.grams)).toEqual([3200, 3400]);
    expect(rows[0].change).toMatchObject({ grams: -200, days: 2, gramsPerDay: -100 });
    expect(rows[1].change).toBeNull();
  });
});

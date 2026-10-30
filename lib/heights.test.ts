import { describe, expect, it } from "vitest";
import type { Height } from "./db/schema";
import { heightPoints, heightRows, heightStats } from "./heights";

// В UTC: между датами не должно быть перехода на летнее/зимнее время.
const at = (month: number, day: number) => new Date(Date.UTC(2026, month, day, 10, 0));

let seq = 0;
function height(measuredAt: Date, heightCm: number): Height {
  seq += 1;
  return {
    id: `h${seq}`,
    childId: "child",
    measuredAt,
    heightCm,
    note: null,
    createdAt: measuredAt,
    updatedAt: measuredAt,
  };
}

const child = { birthDate: at(9, 1), birthHeightCm: 51 };

describe("heightPoints", () => {
  it("ставит рост при рождении первой точкой", () => {
    const points = heightPoints(child, [height(at(11, 1), 58), height(at(10, 1), 55)]);
    expect(points.map((p) => p.cm)).toEqual([51, 55, 58]);
    expect(points[0].height).toBeNull();
  });

  it("без роста при рождении — только измерения", () => {
    const points = heightPoints({ ...child, birthHeightCm: null }, [height(at(10, 1), 55)]);
    expect(points.map((p) => p.cm)).toEqual([55]);
  });
});

describe("heightStats", () => {
  it("без измерений — пусто", () => {
    expect(heightStats(heightPoints(child, []))).toEqual({
      latest: null,
      sincePrevious: null,
      sinceBirth: null,
    });
  });

  it("изменение с прошлого измерения и с рождения, прирост в месяц", () => {
    // 1 окт → 1 ноя → 1 дек 2026: 31 и 30 дней.
    const stats = heightStats(
      heightPoints(child, [height(at(10, 1), 54.5), height(at(11, 1), 57.5)]),
    );
    expect(stats.latest?.cm).toBe(57.5);
    expect(stats.sincePrevious?.cm).toBeCloseTo(3);
    expect(stats.sincePrevious?.days).toBe(30);
    expect(stats.sincePrevious?.cmPerMonth).toBeCloseTo(3.04, 2);
    expect(stats.sinceBirth?.cm).toBeCloseTo(6.5);
    expect(stats.sinceBirth?.cmPerMonth).toBeCloseTo(3.24, 2);
  });

  it("прирост в месяц не считается, если прошло меньше двух недель", () => {
    const stats = heightStats(
      heightPoints(child, [height(at(10, 1), 55), height(at(10, 10), 55.5)]),
    );
    expect(stats.sincePrevious?.cm).toBeCloseTo(0.5);
    expect(stats.sincePrevious?.cmPerMonth).toBeNull();
  });

  it("без роста при рождении нет изменения «с рождения»", () => {
    const stats = heightStats(
      heightPoints({ ...child, birthHeightCm: null }, [height(at(10, 1), 55)]),
    );
    expect(stats.latest?.cm).toBe(55);
    expect(stats.sincePrevious).toBeNull();
    expect(stats.sinceBirth).toBeNull();
  });
});

describe("heightRows", () => {
  it("история от новых к старым с изменением к предыдущей точке", () => {
    const rows = heightRows(heightPoints(child, [height(at(9, 29), 53)]));
    expect(rows.map((r) => r.cm)).toEqual([53, 51]);
    expect(rows[0].change).toMatchObject({ cm: 2, days: 28 });
    expect(rows[0].change?.cmPerMonth).toBeCloseTo(2.17, 2);
    expect(rows[1].change).toBeNull();
  });
});

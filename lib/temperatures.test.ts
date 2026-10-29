import { describe, expect, it } from "vitest";
import type { Temperature } from "./db/schema";
import { formatCelsius, maxLast24h, temperatureLevel } from "./temperatures";

describe("temperatureLevel", () => {
  it.each([
    [35.9, "low"],
    [36, "normal"],
    [37.4, "normal"],
    [37.5, "elevated"],
    [37.9, "elevated"],
    [38, "high"],
    [39.2, "high"],
  ])("%s °C → %s", (celsius, level) => {
    expect(temperatureLevel(celsius)).toBe(level);
  });
});

describe("maxLast24h", () => {
  const now = new Date(2026, 9, 29, 12, 0);
  const t = (id: string, hoursAgo: number, valueCelsius: number): Temperature => {
    const measuredAt = new Date(now.getTime() - hoursAgo * 3_600_000);
    return {
      id,
      childId: "child",
      measuredAt,
      valueCelsius,
      site: "armpit",
      note: null,
      createdAt: measuredAt,
      updatedAt: measuredAt,
    };
  };

  it("берёт максимум только за последние 24 часа", () => {
    const max = maxLast24h([t("old", 30, 39.5), t("a", 20, 37.8), t("b", 2, 37.1)], now);
    expect(max?.id).toBe("a");
  });

  it("при равных значениях — более свежее измерение", () => {
    const max = maxLast24h([t("a", 10, 37.8), t("b", 3, 37.8)], now);
    expect(max?.id).toBe("b");
  });

  it("нет измерений за сутки — null", () => {
    expect(maxLast24h([t("old", 25, 38)], now)).toBeNull();
  });
});

describe("formatCelsius", () => {
  it("десятичная запятая и одна цифра после неё", () => {
    expect(formatCelsius(37)).toBe("37,0 °C");
    expect(formatCelsius(36.6)).toBe("36,6 °C");
  });
});

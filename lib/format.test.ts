import { describe, expect, it } from "vitest";
import { formatCm, formatSigned } from "./format";

describe("formatSigned", () => {
  it("целые: знак и настоящий минус", () => {
    expect(formatSigned(120.4)).toBe("+120");
    expect(formatSigned(-80)).toBe("−80");
    expect(formatSigned(0.3)).toBe("0");
  });

  it("с одним знаком после запятой", () => {
    // 54,3 − 52,1 в плавающей точке = 2,1999…
    expect(formatSigned(54.3 - 52.1, 1)).toBe("+2,2");
    expect(formatSigned(3, 1)).toBe("+3");
    expect(formatSigned(-0.5, 1)).toBe("−0,5");
    expect(formatSigned(0.04, 1)).toBe("0");
  });
});

describe("formatCm", () => {
  it("десятые — только если они есть", () => {
    expect(formatCm(52)).toBe("52 см");
    expect(formatCm(54.5)).toBe("54,5 см");
  });
});

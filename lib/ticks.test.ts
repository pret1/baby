import { describe, expect, it } from "vitest";
import { niceTicks } from "./ticks";

const weightSteps = [50, 100, 200, 250, 500, 1000, 2000, 5000];
const heightSteps = [0.5, 1, 2, 5, 10, 20, 50];

describe("niceTicks", () => {
  it("вес: круглые деления с запасом сверху и снизу", () => {
    expect(niceTicks([3400, 3550], weightSteps)).toEqual([3350, 3400, 3450, 3500, 3550, 3600]);
  });

  it("рост: шаг подбирается так, чтобы интервалов было не больше четырёх", () => {
    expect(niceTicks([50, 54.5], heightSteps)).toEqual([48, 50, 52, 54, 56]);
  });

  it("рост: дробный шаг 0,5 см без ошибок округления", () => {
    expect(niceTicks([52, 52.5], heightSteps)).toEqual([51.5, 52, 52.5, 53]);
  });
});

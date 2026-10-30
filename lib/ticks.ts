/**
 * Круглые равномерные деления оси: первый подходящий шаг из `steps`,
 * при котором выходит не больше ~4 интервалов.
 */
export function niceTicks(values: number[], steps: readonly number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, steps[0] * 2);
  const step = steps.find((s) => range / s <= 4) ?? steps[steps.length - 1];
  const low = Math.floor((min - step / 4) / step) * step;
  const high = Math.ceil((max + step / 4) / step) * step;
  const ticks: number[] = [];
  for (let i = 0; low + i * step <= high; i++) ticks.push(low + i * step);
  return ticks;
}

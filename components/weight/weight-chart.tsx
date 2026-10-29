"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from "recharts";
import { formatGrams } from "@/lib/format";
import { formatDate, formatDateTime } from "@/lib/time";
import type { WeightPoint } from "@/lib/weights";
import { Card, CardTitle } from "../ui";

type Datum = { t: number; grams: number; birth: boolean };

const axisTick = { fill: "var(--muted)", fontSize: 12 };

/** Круглые равномерные деления оси веса (шаг 50/100/200/… г, не больше ~4 интервалов). */
function weightTicks(grams: number[]): number[] {
  const min = Math.min(...grams);
  const max = Math.max(...grams);
  const range = Math.max(max - min, 100);
  const step = [50, 100, 200, 250, 500, 1000, 2000].find((s) => range / s <= 4) ?? 5000;
  const low = Math.floor((min - step / 4) / step) * step;
  const high = Math.ceil((max + step / 4) / step) * step;
  const ticks: number[] = [];
  for (let t = low; t <= high; t += step) ticks.push(t);
  return ticks;
}

export function WeightChart({ points }: { points: WeightPoint[] }) {
  const data: Datum[] = points.map((p) => ({
    t: p.measuredAt.getTime(),
    grams: p.grams,
    birth: p.weight === null,
  }));
  const lastIndex = data.length - 1;
  const yTicks = weightTicks(data.map((d) => d.grams));

  // Подпись значения только у последней точки — остальное в подсказке и истории ниже.
  const endLabel = ({ x, y, index }: LabelProps) =>
    index === lastIndex ? (
      <text
        x={Number(x) + 8}
        y={Number(y)}
        dy={4}
        fill="var(--fg)"
        fontSize={12}
        fontWeight={700}
      >
        {data[lastIndex].grams.toLocaleString("ru-RU")}
      </text>
    ) : null;

  return (
    <Card>
      <CardTitle>Вес, г</CardTitle>
      <LineChart
        responsive
        data={data}
        style={{ width: "100%", height: 200 }}
        margin={{ top: 12, right: 48, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => formatDate(new Date(t))}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[yTicks[0], yTicks[yTicks.length - 1]]}
          ticks={yTicks}
          tickFormatter={(g: number) => g.toLocaleString("ru-RU")}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          content={WeightTooltip}
          cursor={{ stroke: "var(--muted)", strokeWidth: 1 }}
          isAnimationActive={false}
        />
        <Line
          type="linear"
          dataKey="grams"
          stroke="var(--chart)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={{ r: 4, fill: "var(--chart)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--chart)", stroke: "var(--card)", strokeWidth: 2 }}
          label={endLabel}
          isAnimationActive={false}
        />
      </LineChart>
    </Card>
  );
}

function WeightTooltip({ active, payload }: TooltipContentProps) {
  const datum = payload?.[0]?.payload as Datum | undefined;
  if (!active || !datum) return null;
  return (
    <div className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs shadow-sm">
      <div className="text-muted">
        {datum.birth ? "При рождении" : formatDateTime(new Date(datum.t))}
      </div>
      <div className="flex items-center gap-1.5 font-bold text-fg">
        <span className="size-2 rounded-full bg-[var(--chart)]" aria-hidden />
        {formatGrams(datum.grams)}
      </div>
    </div>
  );
}

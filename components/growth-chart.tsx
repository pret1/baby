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
import { niceTicks } from "@/lib/ticks";
import { formatDate, formatDateTime } from "@/lib/time";
import { Card, CardTitle } from "./ui";

/** Точка графика веса или роста. `birth` — значение при рождении из профиля. */
export type GrowthDatum = { t: number; value: number; birth: boolean };

const axisTick = { fill: "var(--muted)", fontSize: 12 };
const formatNumber = (value: number) => value.toLocaleString("ru-RU");

export function GrowthChart({
  title,
  data,
  tickSteps,
  formatValue,
}: {
  title: string;
  data: GrowthDatum[];
  tickSteps: readonly number[];
  /** Значение с единицей измерения — для подсказки. */
  formatValue: (value: number) => string;
}) {
  const lastIndex = data.length - 1;
  const yTicks = niceTicks(data.map((d) => d.value), tickSteps);

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
        {formatNumber(data[lastIndex].value)}
      </text>
    ) : null;

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
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
          tickFormatter={formatNumber}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          content={(props) => <GrowthTooltip {...props} formatValue={formatValue} />}
          cursor={{ stroke: "var(--muted)", strokeWidth: 1 }}
          isAnimationActive={false}
        />
        <Line
          type="linear"
          dataKey="value"
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

function GrowthTooltip({
  active,
  payload,
  formatValue,
}: TooltipContentProps & { formatValue: (value: number) => string }) {
  const datum = payload?.[0]?.payload as GrowthDatum | undefined;
  if (!active || !datum) return null;
  return (
    <div className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs shadow-sm">
      <div className="text-muted">
        {datum.birth ? "При рождении" : formatDateTime(new Date(datum.t))}
      </div>
      <div className="flex items-center gap-1.5 font-bold text-fg">
        <span className="size-2 rounded-full bg-[var(--chart)]" aria-hidden />
        {formatValue(datum.value)}
      </div>
    </div>
  );
}

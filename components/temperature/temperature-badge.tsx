import {
  TEMPERATURE_LEVEL_LABELS,
  formatCelsius,
  temperatureLevel,
  type TemperatureLevel,
} from "@/lib/temperatures";
import { cn } from "../ui";

// Уровень передаётся и цветом, и словом — цвет не единственный носитель смысла.
const levelStyles: Record<TemperatureLevel, string> = {
  low: "bg-cool/20 text-fg",
  normal: "bg-ok/15 text-fg",
  elevated: "bg-warn/30 text-fg",
  high: "bg-bad text-white",
};

const dotStyles: Record<TemperatureLevel, string> = {
  low: "bg-cool",
  normal: "bg-ok",
  elevated: "bg-warn",
  high: "bg-white",
};

export function TemperatureBadge({
  celsius,
  showValue = true,
}: {
  celsius: number;
  showValue?: boolean;
}) {
  const level = temperatureLevel(celsius);
  return (
    <span
      className={cn(
        "mt-0.5 mr-1 inline-flex items-center gap-1.5 rounded-full px-2 py-px text-xs font-semibold",
        levelStyles[level],
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[level])} aria-hidden />
      {showValue && `${formatCelsius(celsius)} · `}
      {TEMPERATURE_LEVEL_LABELS[level]}
    </span>
  );
}

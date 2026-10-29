import type { Feeding, Temperature } from "./db/schema";

export const FEEDING_TYPE_LABELS: Record<Feeding["type"], string> = {
  breast: "Грудь",
  formula: "Смесь",
  pumped: "Сцеженное",
};

export const BREAST_SIDE_LABELS: Record<NonNullable<Feeding["breastSide"]>, string> = {
  left: "Левая",
  right: "Правая",
  both: "Обе",
};

export const TEMPERATURE_SITE_LABELS: Record<Temperature["site"], string> = {
  armpit: "Подмышка",
  rectal: "Ректально",
  ear: "Ухо",
  forehead: "Лоб",
  mouth: "Рот",
};

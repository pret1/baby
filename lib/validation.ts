import { z } from "zod";
import { fromLocalInput } from "./time";

// Схемы двух видов:
// - `xxxSchema` — данные, которые приходят в Server Action (проверяются на сервере);
// - `xxxFormSchema` — значения HTML-формы (всё строки), которые преобразуются
//   и прогоняются через ту же серверную схему (`.pipe`). Правила описаны один раз.

/** Строка из поля ввода → число; пустое поле → NaN (Zod отклонит его с понятным сообщением). */
function parseNumber(value: string): number {
  const trimmed = value.trim();
  return trimmed === "" ? NaN : Number(trimmed.replace(",", "."));
}

/** Необязательное число: пустое поле → null. */
function parseOptionalNumber(value: string): number | null {
  return value.trim() === "" ? null : parseNumber(value);
}

function parseText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const notInFuture = (date: Date) => date.getTime() <= Date.now() + 5 * 60_000;

const pastDate = (requiredMessage: string) =>
  z.date({ error: requiredMessage }).refine(notInFuture, "Время не может быть в будущем");

const note = z.string().max(500, "Слишком длинная заметка").nullable();

export const idSchema = z.uuid();

// --- Профиль ребёнка ---

export const childSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100, "Слишком длинное имя"),
  birthDate: pastDate("Укажите дату и время рождения"),
  birthWeightGrams: z
    .number({ error: "Укажите вес в граммах" })
    .int("Вес — целое число граммов")
    .min(300, "Слишком маленький вес")
    .max(8000, "Слишком большой вес"),
});

export type ChildInput = z.infer<typeof childSchema>;

export const childFormSchema = z
  .object({ name: z.string(), birthDate: z.string(), birthWeightGrams: z.string() })
  .transform((form) => ({
    name: form.name,
    birthDate: fromLocalInput(form.birthDate),
    birthWeightGrams: parseNumber(form.birthWeightGrams),
  }))
  .pipe(childSchema);

// --- Кормления ---

export const FEEDING_TYPES = ["breast", "formula", "pumped"] as const;
export const BREAST_SIDES = ["left", "right", "both"] as const;

export const feedingSchema = z
  .object({
    startedAt: pastDate("Укажите время начала"),
    type: z.enum(FEEDING_TYPES, { error: "Выберите тип кормления" }),
    breastSide: z.enum(BREAST_SIDES).nullable(),
    volumeMl: z
      .number({ error: "Объём — число" })
      .int("Объём — целое число мл")
      .positive("Объём должен быть больше нуля")
      .max(1000, "Слишком большой объём")
      .nullable(),
    durationMin: z
      .number({ error: "Длительность — число" })
      .int("Длительность — целое число минут")
      .positive("Длительность должна быть больше нуля")
      .max(300, "Слишком большая длительность")
      .nullable(),
    note,
  })
  .superRefine((feeding, ctx) => {
    // То же правило, что и CHECK в БД: сторона указывается только для груди.
    if (feeding.type === "breast" && !feeding.breastSide) {
      ctx.addIssue({ code: "custom", path: ["breastSide"], message: "Выберите грудь" });
    }
    if (feeding.type !== "breast" && feeding.breastSide) {
      ctx.addIssue({
        code: "custom",
        path: ["breastSide"],
        message: "Грудь указывается только для кормления грудью",
      });
    }
    if (feeding.type === "breast" && feeding.volumeMl !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["volumeMl"],
        message: "Объём указывается для смеси и сцеженного молока",
      });
    }
  });

export type FeedingInput = z.infer<typeof feedingSchema>;

export const feedingFormSchema = z
  .object({
    startedAt: z.string(),
    type: z.enum(FEEDING_TYPES),
    breastSide: z.enum(BREAST_SIDES),
    volumeMl: z.string(),
    durationMin: z.string(),
    note: z.string(),
  })
  .transform((form) => ({
    startedAt: fromLocalInput(form.startedAt),
    type: form.type,
    // Скрытые поля другого типа кормления не сохраняем.
    breastSide: form.type === "breast" ? form.breastSide : null,
    volumeMl: form.type === "breast" ? null : parseOptionalNumber(form.volumeMl),
    durationMin: parseOptionalNumber(form.durationMin),
    note: parseText(form.note),
  }))
  .pipe(feedingSchema);

export type FeedingFormValues = z.input<typeof feedingFormSchema>;

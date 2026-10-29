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

const notInFuture = (date: Date) => date.getTime() <= Date.now() + 5 * 60_000;

const pastDate = (requiredMessage: string) =>
  z.date({ error: requiredMessage }).refine(notInFuture, "Время не может быть в будущем");

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

import { asc } from "drizzle-orm";
import type { z } from "zod";
import { getDb, type Db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/action-result";

export type { ActionResult };

export const DB_UNAVAILABLE =
  "База данных недоступна — изменения не сохранены. Попробуйте ещё раз.";

export function invalidInput(error: z.ZodError): ActionResult {
  return { ok: false, error: error.issues[0]?.message ?? "Проверьте введённые данные" };
}

/**
 * Выполняет запись в БД. Ошибки соединения не выбрасываются наружу,
 * а возвращаются как результат — форма покажет сообщение и сохранит введённые данные.
 */
export async function runDb(
  fn: (db: Db) => Promise<ActionResult | void>,
): Promise<ActionResult> {
  try {
    return (await fn(getDb())) ?? { ok: true };
  } catch (err) {
    console.error("Database error", err);
    return { ok: false, error: DB_UNAVAILABLE };
  }
}

export async function findChildId(db: Db): Promise<string | null> {
  const [child] = await db
    .select({ id: children.id })
    .from(children)
    .orderBy(asc(children.createdAt))
    .limit(1);
  return child?.id ?? null;
}

export const NO_CHILD: ActionResult = { ok: false, error: "Сначала заполните профиль ребёнка" };
export const NOT_FOUND: ActionResult = {
  ok: false,
  error: "Запись не найдена — возможно, её удалили с другого устройства. Обновите страницу.",
};

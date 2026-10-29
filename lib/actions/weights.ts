"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { weights } from "@/lib/db/schema";
import { weightSchema, idSchema, type WeightInput } from "@/lib/validation";
import {
  NO_CHILD,
  NOT_FOUND,
  findChildId,
  invalidInput,
  runDb,
  type ActionResult,
} from "./helpers";

export async function createWeight(input: WeightInput): Promise<ActionResult> {
  const parsed = weightSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const childId = await findChildId(db);
    if (!childId) return NO_CHILD;
    await db.insert(weights).values({ ...parsed.data, childId });
    refresh();
  });
}

// Last-write-wins: просто перезаписываем запись целиком, updated_at обновится сам.
export async function updateWeight(id: string, input: WeightInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;
  const parsed = weightSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const updated = await db
      .update(weights)
      .set(parsed.data)
      .where(eq(weights.id, parsedId.data))
      .returning({ id: weights.id });
    if (updated.length === 0) return NOT_FOUND;
    refresh();
  });
}

export async function deleteWeight(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;

  return runDb(async (db) => {
    // Если запись уже удалили с другого устройства — результат тот же, это не ошибка.
    await db.delete(weights).where(eq(weights.id, parsedId.data));
    refresh();
  });
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { heights } from "@/lib/db/schema";
import { heightSchema, idSchema, type HeightInput } from "@/lib/validation";
import {
  NO_CHILD,
  NOT_FOUND,
  findChildId,
  invalidInput,
  runDb,
  type ActionResult,
} from "./helpers";

export async function createHeight(input: HeightInput): Promise<ActionResult> {
  const parsed = heightSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const childId = await findChildId(db);
    if (!childId) return NO_CHILD;
    await db.insert(heights).values({ ...parsed.data, childId });
    refresh();
  });
}

// Last-write-wins: просто перезаписываем запись целиком, updated_at обновится сам.
export async function updateHeight(id: string, input: HeightInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;
  const parsed = heightSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const updated = await db
      .update(heights)
      .set(parsed.data)
      .where(eq(heights.id, parsedId.data))
      .returning({ id: heights.id });
    if (updated.length === 0) return NOT_FOUND;
    refresh();
  });
}

export async function deleteHeight(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;

  return runDb(async (db) => {
    // Если запись уже удалили с другого устройства — результат тот же, это не ошибка.
    await db.delete(heights).where(eq(heights.id, parsedId.data));
    refresh();
  });
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { feedings } from "@/lib/db/schema";
import { feedingSchema, idSchema, type FeedingInput } from "@/lib/validation";
import {
  NO_CHILD,
  NOT_FOUND,
  findChildId,
  invalidInput,
  runDb,
  type ActionResult,
} from "./helpers";

export async function createFeeding(input: FeedingInput): Promise<ActionResult> {
  const parsed = feedingSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const childId = await findChildId(db);
    if (!childId) return NO_CHILD;
    await db.insert(feedings).values({ ...parsed.data, childId });
    refresh();
  });
}

// Last-write-wins: просто перезаписываем запись целиком, updated_at обновится сам.
export async function updateFeeding(id: string, input: FeedingInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;
  const parsed = feedingSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const updated = await db
      .update(feedings)
      .set(parsed.data)
      .where(eq(feedings.id, parsedId.data))
      .returning({ id: feedings.id });
    if (updated.length === 0) return NOT_FOUND;
    refresh();
  });
}

export async function deleteFeeding(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;

  return runDb(async (db) => {
    // Если запись уже удалили с другого устройства — результат тот же, это не ошибка.
    await db.delete(feedings).where(eq(feedings.id, parsedId.data));
    refresh();
  });
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { temperatures } from "@/lib/db/schema";
import { temperatureSchema, idSchema, type TemperatureInput } from "@/lib/validation";
import {
  NO_CHILD,
  NOT_FOUND,
  findChildId,
  invalidInput,
  runDb,
  type ActionResult,
} from "./helpers";

export async function createTemperature(input: TemperatureInput): Promise<ActionResult> {
  const parsed = temperatureSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const childId = await findChildId(db);
    if (!childId) return NO_CHILD;
    await db.insert(temperatures).values({ ...parsed.data, childId });
    refresh();
  });
}

// Last-write-wins: просто перезаписываем запись целиком, updated_at обновится сам.
export async function updateTemperature(id: string, input: TemperatureInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;
  const parsed = temperatureSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const updated = await db
      .update(temperatures)
      .set(parsed.data)
      .where(eq(temperatures.id, parsedId.data))
      .returning({ id: temperatures.id });
    if (updated.length === 0) return NOT_FOUND;
    refresh();
  });
}

export async function deleteTemperature(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return NOT_FOUND;

  return runDb(async (db) => {
    // Если запись уже удалили с другого устройства — результат тот же, это не ошибка.
    await db.delete(temperatures).where(eq(temperatures.id, parsedId.data));
    refresh();
  });
}

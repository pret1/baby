"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { children } from "@/lib/db/schema";
import { childSchema, type ChildInput } from "@/lib/validation";
import { findChildId, invalidInput, runDb, type ActionResult } from "./helpers";

export async function saveChild(input: ChildInput): Promise<ActionResult> {
  const parsed = childSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  return runDb(async (db) => {
    const childId = await findChildId(db);
    if (childId) {
      await db.update(children).set(parsed.data).where(eq(children.id, childId));
    } else {
      await db.insert(children).values(parsed.data);
    }
    refresh();
  });
}

/** Удаляет профиль вместе со всеми записями (ON DELETE CASCADE). */
export async function deleteChild(): Promise<ActionResult> {
  return runDb(async (db) => {
    const childId = await findChildId(db);
    if (childId) await db.delete(children).where(eq(children.id, childId));
    refresh();
  });
}

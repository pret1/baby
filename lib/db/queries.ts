import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getDb } from "./index";
import { children, type Child } from "./schema";

// Чтение данных для серверных компонентов. connection() говорит Next.js, что
// результат нужен на каждый запрос (не пререндерить на этапе сборки).

/** Приложение рассчитано на одного ребёнка — берём самый первый профиль. */
export const getChild = cache(async (): Promise<Child | null> => {
  await connection();
  const [child] = await getDb()
    .select()
    .from(children)
    .orderBy(asc(children.createdAt))
    .limit(1);
  return child ?? null;
});

/** Профиля ещё нет (первый запуск) — отправляем заполнять его. */
export async function requireChild(): Promise<Child> {
  const child = await getChild();
  if (!child) redirect("/profile");
  return child;
}

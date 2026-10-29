import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getDb } from "./index";
import { DAY } from "@/lib/time";
import {
  children,
  feedings,
  temperatures,
  weights,
  type Child,
  type Feeding,
  type Temperature,
  type Weight,
} from "./schema";

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

/**
 * Кормления за последние `days` дней (новые сверху) и одно кормление перед этим
 * окном — чтобы у самой старой показанной записи тоже был посчитан интервал.
 */
export async function getFeedings(
  childId: string,
  days: number,
): Promise<{ feedings: Feeding[]; previous: Feeding | null }> {
  await connection();
  const db = getDb();
  const since = new Date(Date.now() - days * DAY);
  const [recent, [previous]] = await Promise.all([
    db
      .select()
      .from(feedings)
      .where(and(eq(feedings.childId, childId), gte(feedings.startedAt, since)))
      .orderBy(desc(feedings.startedAt)),
    db
      .select()
      .from(feedings)
      .where(and(eq(feedings.childId, childId), lt(feedings.startedAt, since)))
      .orderBy(desc(feedings.startedAt))
      .limit(1),
  ]);
  return { feedings: recent, previous: previous ?? null };
}

/** Все взвешивания (их немного), от старых к новым. */
export async function getWeights(childId: string): Promise<Weight[]> {
  await connection();
  return getDb()
    .select()
    .from(weights)
    .where(eq(weights.childId, childId))
    .orderBy(asc(weights.measuredAt));
}

/** Измерения температуры за последние `days` дней (новые сверху) и есть ли более старые. */
export async function getTemperatures(
  childId: string,
  days: number,
): Promise<{ temperatures: Temperature[]; hasOlder: boolean }> {
  await connection();
  const db = getDb();
  const since = new Date(Date.now() - days * DAY);
  const [recent, older] = await Promise.all([
    db
      .select()
      .from(temperatures)
      .where(and(eq(temperatures.childId, childId), gte(temperatures.measuredAt, since)))
      .orderBy(desc(temperatures.measuredAt)),
    db
      .select({ id: temperatures.id })
      .from(temperatures)
      .where(and(eq(temperatures.childId, childId), lt(temperatures.measuredAt, since)))
      .limit(1),
  ]);
  return { temperatures: recent, hasOlder: older.length > 0 };
}

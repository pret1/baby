import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

// Один пул на процесс. В dev модуль перезагружается при каждой правке,
// поэтому храним экземпляр в globalThis, чтобы не плодить соединения.
const globalForDb = globalThis as unknown as { db?: Db };

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    max: 5,
    // Если БД недоступна, быстро падаем с ошибкой вместо долгого зависания —
    // интерфейс покажет сообщение и кнопку «Повторить».
    connectionTimeoutMillis: 5_000,
    query_timeout: 10_000,
  });

  // Neon закрывает простаивающие соединения (scale to zero). Без обработчика
  // ошибка простаивающего клиента уронила бы весь процесс.
  pool.on("error", (err) => {
    console.error("Postgres pool error", err);
  });

  // На Vercel (Fluid Compute) держит функцию живой, пока пул корректно
  // закрывает простаивающие соединения.
  attachDatabasePool(pool);

  return drizzle({ client: pool, schema });
}

export function getDb(): Db {
  globalForDb.db ??= createDb();
  return globalForDb.db;
}

import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Те же .env.local / .env, что читает Next.js
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Миграции — через прямое подключение: pooled (PgBouncer в transaction mode)
  // не держит сессионное состояние. Приложение работает через pooled DATABASE_URL.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});

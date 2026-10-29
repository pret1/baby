# DEVLOG

Журнал разработки: что сделано, какие решения приняты, что осталось.

## 2026-10-29 — Каркас проекта

**Сделано**
- Next.js 16.4 (App Router) + TypeScript (`strict: true`) + Tailwind CSS v4, создано через `create-next-app`.
- Убраны шаблонные шрифты Geist и картинки: используется системный шрифт, как в макете `task/Дневник малыша.html`.
- Палитра макета (светлая и тёмная тема) перенесена в `app/globals.css` как CSS-переменные + токены Tailwind (`bg-card`, `text-muted`, `border-line`, `bg-accent` и т.д.).
- `.gitignore` игнорирует все `.env*`, кроме `.env.example`.

**Решения**
- Оставлены настройки Next.js 16 по умолчанию: `cacheComponents` и `partialPrefetching`. Следствие: все компоненты, читающие БД, вызывают `connection()` и рендерятся внутри `<Suspense>` — статическая «оболочка» страницы отдаётся мгновенно, данные догружаются потоком.
- Даты, «сегодня» и группировка по дням считаются на клиенте по часовому поясу телефона (сервер на Vercel работает в UTC).
- `AGENTS.md` создан `create-next-app` и пересоздаётся `next dev` — оставлен в репозитории.

## 2026-10-29 — Схема БД и первая миграция

**Сделано**
- `lib/db/schema.ts`: таблицы `children`, `feedings`, `weights`, `temperatures` по ТЗ.
- `drizzle.config.ts` читает `DATABASE_URL` из `.env.local` через `@next/env` (тот же механизм, что у Next.js).
- Миграция `drizzle/0000_init.sql`, скрипты `npm run db:generate | db:migrate | db:studio`.
- Проверено на локальном Postgres 17: миграция применяется, CHECK `before_feeding AND after_feeding` отклоняет запись.

**Решения**
- Все даты — `timestamptz`; `birth_date` тоже `timestamptz` (дата и время рождения), а не `date`.
- Перечисления (`feeding_type`, `breast_side`, `temperature_site`) — Postgres enum.
- Первичные ключи — `uuid` (`gen_random_uuid()`).
- Помимо обязательного CHECK для «до/после кормления» добавлены простые CHECK: `breast_side` заполнен только для типа `breast`, объём/длительность/вес > 0, температура 30–45 °C.
- `value_celsius` — `numeric(3,1)`, в коде читается как `number` (`mode: "number"`).
- `updated_at` обновляется автоматически при каждом UPDATE (`$onUpdate`) — этого достаточно для last-write-wins.

**Дальше**
- Подключение к Neon через `pg` + `@vercel/functions`.

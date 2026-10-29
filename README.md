# Дневник малыша

Мобильное веб-приложение для двух родителей: кормления (с автоматическим расчётом
интервалов), вес с графиком, температура с подсветкой. Данные хранятся в Neon Postgres,
оба родителя видят одно и то же.

**Стек:** Next.js 16 (App Router, Server Actions) · TypeScript (strict) · Tailwind CSS 4 ·
Drizzle ORM + `pg` · Neon Postgres · Zod · React Hook Form · Recharts · Vitest.

Ход разработки и принятые решения — в [DEVLOG.md](DEVLOG.md).

## Требования

- Node.js 24 (`node -v`)
- База Postgres: проект в [Neon](https://neon.tech) (бесплатного тарифа достаточно)
  или любой локальный Postgres 15+ для разработки

## Запуск локально

```bash
npm install
cp .env.example .env.local      # вписать свою строку подключения в DATABASE_URL
npm run db:migrate              # создать таблицы
npm run dev                     # http://localhost:3000
```

Проверить с телефона в той же Wi-Fi-сети: `npm run build && npm start` и открыть
`http://<IP-компьютера>:3000` (dev-сервер по умолчанию не пускает запросы с других адресов,
см. `allowedDevOrigins` в документации Next.js).

При первом запуске приложение попросит заполнить профиль ребёнка.

## Подключение Neon

1. Создайте проект в [console.neon.tech](https://console.neon.tech) (регион ближе к вам).
2. **Connect** → скопируйте connection string. Для приложения — вариант **Pooled connection**
   (хост содержит `-pooler`), он лучше переносит много коротких подключений с Vercel.
3. Вставьте строку в `.env.local`:
   ```
   DATABASE_URL=postgres://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```

Для разработки удобно сделать в Neon отдельную ветку (Branches → Create branch)
и использовать её строку подключения локально, а основную ветку оставить для «боевых» данных.

## Миграции

SQL-миграции лежат в `drizzle/` и коммитятся в репозиторий. Схема описана в `lib/db/schema.ts`.

| Команда | Что делает |
| --- | --- |
| `npm run db:migrate` | применяет новые миграции к базе из `DATABASE_URL` |
| `npm run db:generate` | после правки `lib/db/schema.ts` создаёт новый SQL-файл миграции |
| `npm run db:studio` | веб-интерфейс Drizzle Studio для просмотра данных |

Изменение схемы: поправить `lib/db/schema.ts` → `npm run db:generate` → проверить SQL
в `drizzle/` → закоммитить → `npm run db:migrate`.

Миграции **не запускаются автоматически при деплое**: сборка на Vercel не зависит от базы.
Применять их нужно вручную перед деплоем изменений схемы. Для миграций Neon рекомендует
прямое (не pooled) подключение:

```bash
DATABASE_URL="postgres://...@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require" npm run db:migrate
```

## Деплой на Vercel

1. Запушьте репозиторий на GitHub.
2. [vercel.com/new](https://vercel.com/new) → **Import** репозитория. Фреймворк (Next.js)
   определится сам, настройки сборки менять не нужно.
3. **Environment Variables** → `DATABASE_URL` = pooled-строка из Neon
   (для Production, и при желании — Preview со строкой отдельной ветки Neon).
   Вместо ручного шага можно подключить Neon через **Vercel → Storage / Marketplace → Neon** —
   интеграция сама добавит `DATABASE_URL`.
4. **Deploy**. Дальше каждый `git push` в основную ветку деплоится автоматически.
5. Примените миграции к «боевой» базе (см. выше), если ещё не применяли.

Подключение к базе на Vercel идёт через `pg` с пулом и `attachDatabasePool` из
`@vercel/functions` (рекомендация Vercel для Fluid Compute), см. `lib/db/index.ts`.

> Приложение без авторизации: любой, кто знает адрес, может смотреть и менять данные.
> Не публикуйте ссылку. Если понадобится защита — проще всего один общий пароль
> в переменной окружения и проверка в `proxy.ts` (бывший middleware).

## Скрипты

| Команда | |
| --- | --- |
| `npm run dev` | режим разработки |
| `npm run build` / `npm start` | production-сборка и запуск |
| `npm test` | юнит-тесты (интервалы, статистика, возраст, вес, температура) |
| `npm run lint` | ESLint |

## Структура

```
app/
  page.tsx               главная: возраст, быстрые кнопки, сводка
  feeding/ weight/ temperature/ profile/   разделы
  error.tsx              экран «не удалось загрузить данные» + «Повторить»
components/              формы, списки, график, общие UI-элементы
lib/
  db/schema.ts           схема Drizzle
  db/index.ts            подключение (pg + Vercel pool)
  db/queries.ts          чтение данных для страниц
  actions/               Server Actions: создание, изменение, удаление
  validation.ts          Zod-схемы (сервер и формы)
  feedings.ts weights.ts temperatures.ts   расчёты: интервалы, статистика, пороги
  time.ts                даты, возраст, форматирование
drizzle/                 SQL-миграции
```

## Как это устроено (коротко)

- **Чтение:** серверные компоненты внутри `<Suspense>` читают БД и передают данные
  клиентским компонентам.
- **Запись:** Server Actions; вход всегда проверяется Zod на сервере. Конфликты —
  last-write-wins: сохранение перезаписывает запись, `updated_at` обновляется автоматически.
- **Время:** всё хранится как `timestamptz`; «сегодня», группировка по дням и форматирование
  считаются в браузере по часовому поясу телефона.
- **Сбои:** при недоступной БД страница показывает понятную ошибку с кнопкой «Повторить»,
  формы сохраняют введённое и показывают причину. Данные второго родителя подтягиваются
  при возвращении в приложение и раз в 2 минуты.

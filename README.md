# Дневник малыша

Мобильное веб-приложение для двух родителей: кормления (с автоматическим расчётом
интервалов), вес и рост с графиками, температура с подсветкой. Данные хранятся в Neon Postgres,
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

Проект уже привязан к Neon: `neon.ts` в корне описывает сервисы (только Postgres),
а локальная привязка к проекту и ветке хранится в `.neon` (не коммитится).

На новом компьютере:

```bash
npm i -g neon                 # Neon CLI
neon login                    # вход через браузер
neon link --org-id <org> --project-id <project> --branch production
```

`neon link` (и `neon deploy`) сами записывают в `.env.local`:

| Переменная | Что это | Кто использует |
| --- | --- | --- |
| `DATABASE_URL` | pooled-подключение (хост с `-pooler`) | приложение (`lib/db/index.ts`) |
| `DATABASE_URL_UNPOOLED` | прямое подключение | миграции (`drizzle.config.ts`) |

Без CLI: [console.neon.tech](https://console.neon.tech) → проект → **Connect** → скопировать
обе строки (с Connection pooling и без) в `.env.local`, см. `.env.example`.

Для разработки удобно отдельная ветка: `neon checkout dev --create` создаёт её из `production`
и переписывает `.env.local` на её строки. Вернуться: `neon checkout production`.

## Миграции

SQL-миграции лежат в `drizzle/` и коммитятся в репозиторий. Схема описана в `lib/db/schema.ts`.

| Команда | Что делает |
| --- | --- |
| `npm run db:migrate` | применяет новые миграции к базе из `DATABASE_URL_UNPOOLED` (или `DATABASE_URL`) |
| `npm run db:generate` | после правки `lib/db/schema.ts` создаёт новый SQL-файл миграции |
| `npm run db:studio` | веб-интерфейс Drizzle Studio для просмотра данных |

Изменение схемы: поправить `lib/db/schema.ts` → `npm run db:generate` → проверить SQL
в `drizzle/` → закоммитить → `npm run db:migrate`.

Миграции **не запускаются автоматически при деплое**: сборка на Vercel не зависит от базы.
Применять их нужно вручную перед деплоем изменений схемы. Миграции идут через прямое
подключение `DATABASE_URL_UNPOOLED`: pooled-подключение (PgBouncer) не держит сессионное
состояние, которое нужно drizzle-kit. Миграцию лучше сначала проверить на ветке
(`neon checkout dev --create` → `npm run db:migrate`), потом применить к `production`.

## Деплой на Vercel

1. Запушьте репозиторий на GitHub.
2. [vercel.com/new](https://vercel.com/new) → **Import** репозитория. Фреймворк (Next.js)
   определится сам, настройки сборки менять не нужно.
3. **Environment Variables** → `DATABASE_URL` = pooled-строка из Neon
   (для Production, и при желании — Preview со строкой отдельной ветки Neon).
   Вместо ручного шага можно подключить Neon через **Vercel → Storage / Marketplace → Neon** —
   интеграция сама добавит `DATABASE_URL`.
4. **Settings → Functions → Function Region** → `fra1` (Frankfurt): база Neon в
   `eu-central-1`, функции рядом с ней — меньше задержка на каждый запрос.
5. **Deploy**. Дальше каждый `git push` в основную ветку деплоится автоматически.
6. Примените миграции к «боевой» базе (см. выше), если ещё не применяли.

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
| `npm test` | юнит-тесты (интервалы, статистика, возраст, вес, рост, температура) |
| `npm run lint` | ESLint |

## Структура

```
app/
  page.tsx               главная: возраст, быстрые кнопки, сводка
  feeding/ weight/ height/ temperature/ profile/   разделы
  error.tsx              экран «не удалось загрузить данные» + «Повторить»
components/              формы, списки, график, общие UI-элементы
lib/
  db/schema.ts           схема Drizzle
  db/index.ts            подключение (pg + Vercel pool)
  db/queries.ts          чтение данных для страниц
  actions/               Server Actions: создание, изменение, удаление
  validation.ts          Zod-схемы (сервер и формы)
  feedings.ts weights.ts heights.ts temperatures.ts   расчёты: интервалы, прирост, пороги
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

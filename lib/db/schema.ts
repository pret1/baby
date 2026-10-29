import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const feedingType = pgEnum("feeding_type", ["breast", "formula", "pumped"]);
export const breastSide = pgEnum("breast_side", ["left", "right", "both"]);
export const temperatureSite = pgEnum("temperature_site", [
  "armpit",
  "rectal",
  "ear",
  "forehead",
  "mouth",
]);

// Синхронизация между родителями — last-write-wins: любое сохранение просто
// перезаписывает строку, а updated_at обновляется автоматически ($onUpdate).
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const children = pgTable(
  "children",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    birthDate: timestamp("birth_date", { withTimezone: true }).notNull(),
    birthWeightGrams: integer("birth_weight_grams").notNull(),
    ...timestamps,
  },
  (t) => [check("children_birth_weight_positive", sql`${t.birthWeightGrams} > 0`)],
);

export const feedings = pgTable(
  "feedings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    type: feedingType("type").notNull(),
    breastSide: breastSide("breast_side"),
    volumeMl: integer("volume_ml"),
    durationMin: integer("duration_min"),
    note: text("note"),
    ...timestamps,
  },
  (t) => [
    index("feedings_child_started_idx").on(t.childId, t.startedAt),
    check(
      "feedings_breast_side_only_for_breast",
      sql`(${t.type} = 'breast') = (${t.breastSide} is not null)`,
    ),
    check("feedings_volume_positive", sql`${t.volumeMl} > 0`),
    check("feedings_duration_positive", sql`${t.durationMin} > 0`),
  ],
);

export const weights = pgTable(
  "weights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    weightGrams: integer("weight_grams").notNull(),
    beforeFeeding: boolean("before_feeding").notNull().default(false),
    afterFeeding: boolean("after_feeding").notNull().default(false),
    freshDiaper: boolean("fresh_diaper").notNull().default(false),
    note: text("note"),
    ...timestamps,
  },
  (t) => [
    index("weights_child_measured_idx").on(t.childId, t.measuredAt),
    check("weights_not_before_and_after", sql`not (${t.beforeFeeding} and ${t.afterFeeding})`),
    check("weights_positive", sql`${t.weightGrams} > 0`),
  ],
);

export const temperatures = pgTable(
  "temperatures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    valueCelsius: numeric("value_celsius", { precision: 3, scale: 1, mode: "number" }).notNull(),
    site: temperatureSite("site").notNull(),
    note: text("note"),
    ...timestamps,
  },
  (t) => [
    index("temperatures_child_measured_idx").on(t.childId, t.measuredAt),
    check("temperatures_value_range", sql`${t.valueCelsius} between 30 and 45`),
  ],
);

export type Child = typeof children.$inferSelect;
export type Feeding = typeof feedings.$inferSelect;
export type Weight = typeof weights.$inferSelect;
export type Temperature = typeof temperatures.$inferSelect;

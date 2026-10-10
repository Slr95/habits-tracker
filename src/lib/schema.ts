import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default(""),
  goal: integer("goal").notNull().default(31),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: serial("id").primaryKey(),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    completed: boolean("completed").notNull().default(false),
  },
  (table) => [
    unique("daily_logs_habit_date_unique").on(table.habitId, table.logDate),
    index("daily_logs_date_idx").on(table.logDate),
  ],
);

export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: serial("id").primaryKey(),
    metricDate: date("metric_date").notNull().unique(),
    mood: smallint("mood"),
    motivation: smallint("motivation"),
  },
  (table) => [
    index("daily_metrics_date_idx").on(table.metricDate),
    check(
      "daily_metrics_mood_range",
      sql`${table.mood} IS NULL OR (${table.mood} >= 1 AND ${table.mood} <= 5)`,
    ),
    check(
      "daily_metrics_motivation_range",
      sql`${table.motivation} IS NULL OR (${table.motivation} >= 1 AND ${table.motivation} <= 5)`,
    ),
  ],
);

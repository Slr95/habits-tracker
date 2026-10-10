import { asc } from "drizzle-orm";
import { io } from "next/cache";
import { getDb } from "@/lib/db";
import { dailyLogs, dailyMetrics, habits } from "@/lib/schema";
import type { DailyLog, DailyMetric, Habit } from "@/lib/types";

export async function getTrackerData(): Promise<{
  habits: Habit[];
  logs: DailyLog[];
  metrics: DailyMetric[];
}> {
  await io();

  try {
    const db = getDb();
    const [habitRows, logRows, metricRows] = await Promise.all([
      db.select().from(habits).orderBy(asc(habits.sortOrder), asc(habits.id)),
      db
        .select({
          habitId: dailyLogs.habitId,
          logDate: dailyLogs.logDate,
          completed: dailyLogs.completed,
        })
        .from(dailyLogs),
      db
        .select({
          metricDate: dailyMetrics.metricDate,
          mood: dailyMetrics.mood,
          motivation: dailyMetrics.motivation,
        })
        .from(dailyMetrics),
    ]);

    return {
      habits: habitRows.map(({ id, name, emoji, goal, sortOrder }) => ({
        id,
        name,
        emoji,
        goal,
        sortOrder,
      })),
      logs: logRows,
      metrics: metricRows,
    };
  } catch (error) {
    console.error("Failed to load habit tracker", error);
    throw new Error("Could not reach the database. Check DATABASE_URL and that the Neon project is active.");
  }
}

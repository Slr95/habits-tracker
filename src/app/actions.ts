"use server";

import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { dailyLogs, dailyMetrics, habits } from "@/lib/schema";
import type { ActionResult, Habit, MetricField } from "@/lib/types";

function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

function clampName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 60);
}

function clampEmoji(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "✦";
  return Array.from(trimmed).slice(0, 4).join("");
}

function clampGoal(value: number) {
  if (!Number.isFinite(value)) return null;
  const goal = Math.round(value);
  if (goal < 1 || goal > 31) return null;
  return goal;
}

function assertIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function toggleDailyLog(
  habitId: number,
  logDate: string,
  completed: boolean,
): Promise<ActionResult<{ habitId: number; logDate: string; completed: boolean }>> {
  if (!Number.isInteger(habitId) || habitId < 1) return fail("Invalid habit.");
  if (!assertIsoDate(logDate)) return fail("Invalid date.");

  try {
    const db = getDb();
    if (completed) {
      await db
        .insert(dailyLogs)
        .values({ habitId, logDate, completed: true })
        .onConflictDoUpdate({
          target: [dailyLogs.habitId, dailyLogs.logDate],
          set: { completed: true },
        });
    } else {
      await db
        .delete(dailyLogs)
        .where(and(eq(dailyLogs.habitId, habitId), eq(dailyLogs.logDate, logDate)));
    }
    return { ok: true, data: { habitId, logDate, completed } };
  } catch (error) {
    console.error("toggleDailyLog", error);
    return fail("Could not save that check. It was reverted.");
  }
}

export async function setDailyMetric(
  metricDate: string,
  field: MetricField,
  value: number | null,
): Promise<ActionResult<{ metricDate: string; field: MetricField; value: number | null }>> {
  if (!assertIsoDate(metricDate)) return fail("Invalid date.");
  if (field !== "mood" && field !== "motivation") return fail("Invalid metric.");
  if (value !== null && (!Number.isInteger(value) || value < 1 || value > 5)) {
    return fail("Score must be between 1 and 5.");
  }

  try {
    const db = getDb();
    await db
      .insert(dailyMetrics)
      .values({
        metricDate,
        mood: field === "mood" ? value : null,
        motivation: field === "motivation" ? value : null,
      })
      .onConflictDoUpdate({
        target: dailyMetrics.metricDate,
        set: { [field]: value },
      });
    return { ok: true, data: { metricDate, field, value } };
  } catch (error) {
    console.error("setDailyMetric", error);
    return fail("Could not save that score. It was reverted.");
  }
}

export async function createHabit(input: {
  name: string;
  emoji: string;
  goal: number;
}): Promise<ActionResult<Habit>> {
  const name = clampName(input.name);
  const emoji = clampEmoji(input.emoji);
  const goal = clampGoal(input.goal);
  if (!name) return fail("Give the habit a name.");
  if (goal == null) return fail("Goal must be between 1 and 31 days.");

  try {
    const db = getDb();
    const [maxRow] = await db
      .select({ value: sql<number>`coalesce(max(${habits.sortOrder}), 0)` })
      .from(habits);
    const sortOrder = Number(maxRow?.value ?? 0) + 1;
    const [row] = await db
      .insert(habits)
      .values({ name, emoji, goal, sortOrder })
      .returning({
        id: habits.id,
        name: habits.name,
        emoji: habits.emoji,
        goal: habits.goal,
        sortOrder: habits.sortOrder,
      });
    if (!row) return fail("Could not add that habit.");
    return { ok: true, data: row };
  } catch (error) {
    console.error("createHabit", error);
    return fail("Could not add that habit.");
  }
}

export async function deleteHabit(habitId: number): Promise<ActionResult<{ id: number }>> {
  if (!Number.isInteger(habitId) || habitId < 1) return fail("Invalid habit.");

  try {
    const db = getDb();
    await db.delete(habits).where(eq(habits.id, habitId));
    return { ok: true, data: { id: habitId } };
  } catch (error) {
    console.error("deleteHabit", error);
    return fail("Could not delete that habit.");
  }
}

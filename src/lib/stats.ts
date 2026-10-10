import { monthDays, buildMonth } from "@/lib/dates";
import type { DailyLog, DailyMetric, Habit, MetricField } from "@/lib/types";

export type HabitStat = Habit & {
  monthGoal: number;
  actual: number;
  left: number;
  percent: number;
};

export type DayStat = {
  day: number;
  date: string;
  label: string;
  percent: number;
};

export type WeekStat = {
  week: string;
  percent: number;
};

export type MonthSummary = {
  dayStats: DayStat[];
  weekStats: WeekStat[];
  habitStats: HabitStat[];
  ranked: HabitStat[];
  goal: number;
  completed: number;
  left: number;
  percent: number;
};

export function logKey(habitId: number, logDate: string) {
  return `${habitId}|${logDate}`;
}

export function upsertLog(logs: DailyLog[], update: DailyLog) {
  const rest = logs.filter(
    (log) => !(log.habitId === update.habitId && log.logDate === update.logDate),
  );
  if (!update.completed) return rest;
  return [...rest, update];
}

export function upsertMetric(metrics: DailyMetric[], date: string, field: MetricField, value: number | null) {
  const existing = metrics.find((metric) => metric.metricDate === date);
  const next: DailyMetric = existing
    ? { ...existing, [field]: value }
    : { metricDate: date, mood: null, motivation: null, [field]: value };
  const rest = metrics.filter((metric) => metric.metricDate !== date);
  if (next.mood === null && next.motivation === null) return rest;
  return [...rest, next];
}

export function cycleScore(current: number | null) {
  if (current == null || current < 1) return 1;
  if (current >= 5) return null;
  return current + 1;
}

export function completedSet(logs: DailyLog[]) {
  const keys = new Set<string>();
  for (const log of logs) {
    if (log.completed) keys.add(logKey(log.habitId, log.logDate));
  }
  return keys;
}

export function summarizeMonth(habits: Habit[], logs: DailyLog[], year: number, month: number): MonthSummary {
  const weeks = buildMonth(year, month);
  const days = monthDays(weeks);
  const done = completedSet(logs);

  const dayStats: DayStat[] = days.map((day) => {
    const hits = habits.filter((habit) => done.has(logKey(habit.id, day.date))).length;
    const percent = habits.length === 0 ? 0 : (hits / habits.length) * 100;
    return { day: day.day, date: day.date, label: String(day.day), percent };
  });

  const weekStats: WeekStat[] = weeks
    .map((week) => {
      const validDays = week.days.filter((day) => day !== null);
      const possible = validDays.length * habits.length;
      if (possible === 0) return null;
      let hits = 0;
      for (const day of validDays) {
        for (const habit of habits) {
          if (done.has(logKey(habit.id, day.date))) hits += 1;
        }
      }
      return { week: `W${week.index}`, percent: (hits / possible) * 100 };
    })
    .filter((week): week is WeekStat => week !== null);

  const habitStats: HabitStat[] = habits.map((habit) => {
    const monthGoal = Math.min(habit.goal, days.length);
    const actual = days.filter((day) => done.has(logKey(habit.id, day.date))).length;
    const left = Math.max(0, monthGoal - actual);
    const percent = monthGoal === 0 ? 0 : (actual / monthGoal) * 100;
    return { ...habit, monthGoal, actual, left, percent };
  });

  const ranked = [...habitStats].sort(
    (a, b) => b.percent - a.percent || b.actual - a.actual || a.sortOrder - b.sortOrder,
  );
  const goal = habitStats.reduce((sum, habit) => sum + habit.monthGoal, 0);
  const completed = habitStats.reduce((sum, habit) => sum + habit.actual, 0);
  const left = Math.max(0, goal - completed);
  const percent = goal === 0 ? 0 : (Math.min(completed, goal) / goal) * 100;

  return { dayStats, weekStats, habitStats, ranked, goal, completed, left, percent };
}

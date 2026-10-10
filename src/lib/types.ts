export type Habit = {
  id: number;
  name: string;
  emoji: string;
  goal: number;
  sortOrder: number;
};

export type DailyLog = {
  habitId: number;
  logDate: string;
  completed: boolean;
};

export type MetricField = "mood" | "motivation";

export type DailyMetric = {
  metricDate: string;
  mood: number | null;
  motivation: number | null;
};

export type ActionError = { ok: false; error: string };
export type ActionOk<T> = { ok: true; data: T };
export type ActionResult<T> = ActionOk<T> | ActionError;

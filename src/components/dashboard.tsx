"use client";

import { useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { createHabit, deleteHabit, setDailyMetric, toggleDailyLog } from "@/app/actions";
import { HabitGrid } from "@/components/habit-grid";
import { DailyProgressChart, WeeklyProgressChart } from "@/components/progress-charts";
import { StatsPanels } from "@/components/stats-panels";
import { TrackerHeader } from "@/components/tracker-header";
import { MONTHS, buildMonth, monthDays, toIsoDate } from "@/lib/dates";
import {
  completedSet,
  cycleScore,
  logKey,
  summarizeMonth,
  upsertLog,
  upsertMetric,
} from "@/lib/stats";
import type { DailyLog, DailyMetric, Habit, MetricField } from "@/lib/types";

type DashboardProps = {
  initialHabits: Habit[];
  initialLogs: DailyLog[];
  initialMetrics: DailyMetric[];
};

export function Dashboard({ initialHabits, initialLogs, initialMetrics }: DashboardProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [metrics, setMetrics] = useState(initialMetrics);
  const clock = useSyncExternalStore(subscribeClock, readClock, getServerClock);
  const [cursor, setCursor] = useState<{ year: number; month: number } | null>(null);
  const year = cursor?.year ?? clock.year;
  const month = cursor?.month ?? clock.month;
  const today = clock.today;
  const [saveError, setSaveError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const logSeq = useRef(new Map<string, number>());
  const metricSeq = useRef(new Map<string, number>());
  const logsRef = useRef(initialLogs);
  const metricsRef = useRef(initialMetrics);

  function commitLogs(next: DailyLog[]) {
    logsRef.current = next;
    setLogs(next);
  }

  function commitMetrics(next: DailyMetric[]) {
    metricsRef.current = next;
    setMetrics(next);
  }

  const weeks = useMemo(() => buildMonth(year, month), [year, month]);
  const days = useMemo(() => monthDays(weeks), [weeks]);
  const summary = useMemo(() => summarizeMonth(habits, logs, year, month), [habits, logs, year, month]);
  const done = useMemo(() => completedSet(logs), [logs]);
  const metricsByDate = useMemo(() => {
    const map = new Map<string, DailyMetric>();
    for (const metric of metrics) map.set(metric.metricDate, metric);
    return map;
  }, [metrics]);

  const orderedHabits = useMemo(
    () => [...habits].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [habits],
  );

  function toggle(habitId: number, logDate: string) {
    const key = logKey(habitId, logDate);
    const seq = (logSeq.current.get(key) ?? 0) + 1;
    logSeq.current.set(key, seq);
    const completed = !logsRef.current.some(
      (log) => log.habitId === habitId && log.logDate === logDate && log.completed,
    );
    const next = upsertLog(logsRef.current, { habitId, logDate, completed });
    commitLogs(next);
    setSaveError(null);
    startTransition(async () => {
      const result = await toggleDailyLog(habitId, logDate, completed);
      if (logSeq.current.get(key) !== seq) return;
      if (!result.ok) {
        commitLogs(upsertLog(logsRef.current, { habitId, logDate, completed: !completed }));
        setSaveError(result.error);
      }
    });
  }

  function cycleMetric(metricDate: string, field: MetricField) {
    const key = `${metricDate}|${field}`;
    const seq = (metricSeq.current.get(key) ?? 0) + 1;
    metricSeq.current.set(key, seq);
    const existing = metricsRef.current.find((metric) => metric.metricDate === metricDate);
    const nextValue = cycleScore(existing?.[field] ?? null);
    const next = upsertMetric(metricsRef.current, metricDate, field, nextValue);
    commitMetrics(next);
    setSaveError(null);
    startTransition(async () => {
      const result = await setDailyMetric(metricDate, field, nextValue);
      if (metricSeq.current.get(key) !== seq) return;
      if (!result.ok) {
        commitMetrics(upsertMetric(metricsRef.current, metricDate, field, previousScore(nextValue)));
        setSaveError(result.error);
      }
    });
  }

  async function addHabit(input: { name: string; emoji: string; goal: number }) {
    setAdding(true);
    setSaveError(null);
    const result = await createHabit(input);
    setAdding(false);
    if (!result.ok) {
      setSaveError(result.error);
      return false;
    }
    setHabits((current) => [...current, result.data]);
    return true;
  }

  function removeHabit(habit: Habit) {
    if (!window.confirm(`Delete ${habit.name}? Its checkmarks for every month will be removed.`)) return;
    const previousHabits = habits;
    const previousLogs = logsRef.current;
    setHabits(previousHabits.filter((item) => item.id !== habit.id));
    commitLogs(previousLogs.filter((log) => log.habitId !== habit.id));
    setSaveError(null);
    startTransition(async () => {
      const result = await deleteHabit(habit.id);
      if (!result.ok) {
        setHabits(previousHabits);
        commitLogs(previousLogs);
        setSaveError(result.error);
      }
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 p-3 md:p-5">
      {saveError ? (
        <p role="alert" className="border border-[#8d4b3e] bg-[#f8e7e1] px-3 py-2 text-sm text-[#6d3328]">
          {saveError}
        </p>
      ) : null}
      <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <TrackerHeader
            year={year}
            month={month}
            dayCount={days.length}
            weekCount={weeks.length}
            saving={isPending || adding}
            onYear={(nextYear) => setCursor({ year: nextYear, month })}
            onMonth={(nextMonth) => setCursor({ year, month: nextMonth })}
          />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <DailyProgressChart data={summary.dayStats} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <WeeklyProgressChart data={summary.weekStats} />
        </div>
      </div>
      <HabitGrid
        habits={orderedHabits}
        weeks={weeks}
        monthLabel={`${MONTHS[month - 1]} ${year}`}
        today={today}
        isCompleted={(habitId, date) => done.has(logKey(habitId, date))}
        metricFor={(date) => metricsByDate.get(date) ?? { mood: null, motivation: null }}
        onToggle={toggle}
        onCycleMetric={cycleMetric}
        onCreate={addHabit}
        onDelete={removeHabit}
        adding={adding}
      />
      <StatsPanels summary={summary} />
    </main>
  );
}

function previousScore(value: number | null) {
  if (value == null) return 5;
  if (value <= 1) return null;
  return value - 1;
}

const SERVER_CLOCK = { year: 2026, month: 10, today: "" };
let cachedClockKey = "";
let cachedClock = SERVER_CLOCK;

function subscribeClock() {
  return () => {};
}

function readClock() {
  const now = new Date();
  const today = toIsoDate(now);
  const key = `${now.getFullYear()}-${now.getMonth() + 1}-${today}`;
  if (key !== cachedClockKey) {
    cachedClockKey = key;
    cachedClock = { year: now.getFullYear(), month: now.getMonth() + 1, today };
  }
  return cachedClock;
}

function getServerClock() {
  return SERVER_CLOCK;
}

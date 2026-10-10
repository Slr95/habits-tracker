"use client";

import { useState, type FormEvent } from "react";
import type { CalendarWeek } from "@/lib/dates";
import type { Habit } from "@/lib/types";

type MetricValue = { mood: number | null; motivation: number | null };

type HabitGridProps = {
  habits: Habit[];
  weeks: CalendarWeek[];
  monthLabel: string;
  today: string;
  isCompleted: (habitId: number, date: string) => boolean;
  metricFor: (date: string) => MetricValue;
  onToggle: (habitId: number, date: string) => void;
  onCycleMetric: (date: string, field: "mood" | "motivation") => void;
  onCreate: (input: { name: string; emoji: string; goal: number }) => Promise<boolean>;
  onDelete: (habit: Habit) => void;
  adding: boolean;
};

export function HabitGrid({
  habits,
  weeks,
  monthLabel,
  today,
  isCompleted,
  metricFor,
  onToggle,
  onCycleMetric,
  onCreate,
  onDelete,
  adding,
}: HabitGridProps) {
  const columns = weeks.flatMap((week) => week.days);

  return (
    <section className="border border-line bg-paper">
      <div className="sheet-scroll overflow-x-auto">
        <table className="w-max border-separate border-spacing-0 text-xs">
          <caption className="sr-only">Habit tracker for {monthLabel}. Weeks start on Saturday.</caption>
          <thead>
            <tr>
              <th
                rowSpan={3}
                className="sticky left-0 z-30 w-[240px] min-w-[220px] border-r border-b border-line bg-soil px-3 text-center text-sm font-semibold tracking-wide text-paper"
              >
                My Habits
              </th>
              {weeks.map((week) => (
                <th
                  key={week.index}
                  colSpan={7}
                  className="border-r border-b border-line bg-clay px-1 py-1.5 text-center text-[11px] font-semibold tracking-[0.14em] text-paper uppercase"
                >
                  Week {week.index}
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((day, index) => (
                <th
                  key={`weekday-${index}`}
                  className={`w-9 min-w-9 border-r border-b border-line py-1 text-center font-medium ${
                    day?.date === today
                      ? "bg-bark text-paper"
                      : day?.weekend
                        ? "bg-sand text-soil"
                        : "bg-foam text-soil"
                  }`}
                >
                  {day?.weekday ?? ""}
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((day, index) => (
                <th
                  key={`day-${index}`}
                  className={`w-9 min-w-9 border-r border-b border-line py-1 text-center tabular-nums ${
                    day?.date === today ? "bg-bark font-semibold text-paper" : "bg-khaki text-ink"
                  }`}
                >
                  {day?.day ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="group">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-b border-line bg-khaki px-2 text-left font-medium text-ink"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-sm" aria-hidden="true">
                      {habit.emoji}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{habit.name}</span>
                    <button
                      type="button"
                      onClick={() => onDelete(habit)}
                      className="px-1 text-soil opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Delete ${habit.name}`}
                    >
                      ×
                    </button>
                  </span>
                </th>
                {columns.map((day, index) => {
                  if (!day) {
                    return <td key={`${habit.id}-empty-${index}`} className="border-r border-b border-line bg-sand" />;
                  }
                  const checked = isCompleted(habit.id, day.date);
                  return (
                    <td key={`${habit.id}-${day.date}`} className="border-r border-b border-line p-0">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        aria-label={`${habit.name} on ${monthLabel} ${day.day}`}
                        onClick={() => onToggle(habit.id, day.date)}
                        className={`flex h-9 w-9 items-center justify-center ${
                          day.date === today ? "bg-[#fff8ea]" : day.weekend ? "bg-foam" : "bg-white"
                        } text-ink hover:bg-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bark`}
                      >
                        {checked ? <CheckMark /> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            <MetricRow
              label="Mood"
              field="mood"
              columns={columns}
              monthLabel={monthLabel}
              today={today}
              metricFor={metricFor}
              onCycleMetric={onCycleMetric}
            />
            <MetricRow
              label="Motivation"
              field="motivation"
              columns={columns}
              monthLabel={monthLabel}
              today={today}
              metricFor={metricFor}
              onCycleMetric={onCycleMetric}
            />
          </tbody>
        </table>
      </div>
      <AddHabitForm onCreate={onCreate} adding={adding} />
      <p className="border-t border-line bg-foam px-3 py-2 text-xs text-soil">
        Click a square to check a habit. Mood and motivation cycle from 1 to 5.
      </p>
    </section>
  );
}

function MetricRow({
  label,
  field,
  columns,
  monthLabel,
  today,
  metricFor,
  onCycleMetric,
}: {
  label: string;
  field: "mood" | "motivation";
  columns: CalendarWeek["days"];
  monthLabel: string;
  today: string;
  metricFor: (date: string) => MetricValue;
  onCycleMetric: (date: string, field: "mood" | "motivation") => void;
}) {
  return (
    <tr>
      <th
        scope="row"
        className="sticky left-0 z-10 border-r border-b border-line bg-soil px-3 text-left text-sm font-semibold text-paper"
      >
        {label}
      </th>
      {columns.map((day, index) => {
        if (!day) {
          return <td key={`${field}-empty-${index}`} className="border-r border-b border-line bg-sand" />;
        }
        const value = metricFor(day.date)[field];
        return (
          <td key={`${field}-${day.date}`} className="border-r border-b border-line p-0">
            <button
              type="button"
              onClick={() => onCycleMetric(day.date, field)}
              aria-label={`${label} on ${monthLabel} ${day.day}: ${value ?? "empty"}`}
              title={`${label}: click to cycle 1–5`}
              className={`flex h-9 w-9 items-center justify-center text-[13px] font-semibold tabular-nums ${
                day.date === today ? "bg-[#efe4cf] text-bark" : "bg-foam text-bark"
              } hover:bg-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bark`}
            >
              {value ?? ""}
            </button>
          </td>
        );
      })}
    </tr>
  );
}

function AddHabitForm({
  onCreate,
  adding,
}: {
  onCreate: HabitGridProps["onCreate"];
  adding: boolean;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [goal, setGoal] = useState(31);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onCreate({ name, emoji, goal });
    if (saved) {
      setName("");
      setEmoji("");
      setGoal(31);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 border-t border-line bg-foam px-3 py-3">
      <label className="flex w-16 flex-col gap-1 text-[11px] font-semibold tracking-wide text-soil uppercase">
        Emoji
        <input
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
          maxLength={8}
          placeholder="✦"
          className="h-9 border border-line bg-paper px-2 text-center text-base text-ink outline-none focus:border-bark"
        />
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[11px] font-semibold tracking-wide text-soil uppercase">
        New habit
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          required
          placeholder="Name"
          className="h-9 border border-line bg-paper px-2 text-sm text-ink outline-none focus:border-bark"
        />
      </label>
      <label className="flex w-20 flex-col gap-1 text-[11px] font-semibold tracking-wide text-soil uppercase">
        Goal
        <input
          type="number"
          min={1}
          max={31}
          value={goal}
          onChange={(event) => setGoal(Number(event.target.value))}
          className="h-9 border border-line bg-paper px-2 text-sm text-ink outline-none focus:border-bark"
        />
      </label>
      <button
        type="submit"
        disabled={adding}
        className="h-9 border border-line bg-bark px-4 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {adding ? "Adding…" : "Add habit"}
      </button>
    </form>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3.2 8.3 6.4 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

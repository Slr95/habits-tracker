"use client";

import { MONTHS } from "@/lib/dates";

const YEAR_OPTIONS = Array.from({ length: 12 }, (_, index) => 2020 + index);

type TrackerHeaderProps = {
  year: number;
  month: number;
  dayCount: number;
  weekCount: number;
  saving: boolean;
  onYear: (year: number) => void;
  onMonth: (month: number) => void;
};

export function TrackerHeader({
  year,
  month,
  dayCount,
  weekCount,
  saving,
  onYear,
  onMonth,
}: TrackerHeaderProps) {
  const monthName = MONTHS[month - 1] ?? "January";
  const years = YEAR_OPTIONS.includes(year) ? YEAR_OPTIONS : [...YEAR_OPTIONS, year].sort((a, b) => a - b);

  return (
    <section className="overflow-hidden border border-line bg-paper">
      <div className="bg-bark px-4 py-5 text-center text-paper">
        <h1 className="font-display text-[1.85rem] leading-none font-semibold tracking-[0.08em]">
          HABIT TRACKER
        </h1>
        <p className="mt-3 font-display text-xl tracking-[0.18em]">- {monthName} -</p>
      </div>
      <div className="bg-soil px-3 py-1.5 text-center text-[11px] font-semibold tracking-[0.2em] text-paper uppercase">
        Calendar settings
      </div>
      <div className="grid grid-cols-[92px_1fr] text-sm">
        <label htmlFor="tracker-year" className="bg-khaki px-3 py-2.5 font-semibold text-ink">
          Year
        </label>
        <div className="border-l border-line p-1.5">
          <select
            id="tracker-year"
            value={year}
            onChange={(event) => onYear(Number(event.target.value))}
            className="h-9 w-full border border-line bg-paper px-2 text-ink outline-none focus:border-bark"
          >
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <label htmlFor="tracker-month" className="border-t border-line bg-khaki px-3 py-2.5 font-semibold text-ink">
          Month
        </label>
        <div className="border-t border-l border-line p-1.5">
          <select
            id="tracker-month"
            value={month}
            onChange={(event) => onMonth(Number(event.target.value))}
            className="h-9 w-full border border-line bg-paper px-2 text-ink outline-none focus:border-bark"
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line bg-foam px-3 py-2 text-xs text-soil">
        <span className="tabular-nums">
          {dayCount} days · {weekCount} weeks
        </span>
        <span className="min-h-4" aria-live="polite">
          {saving ? "Saving…" : ""}
        </span>
      </div>
    </section>
  );
}

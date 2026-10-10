"use client";

import { OverallDonut } from "@/components/progress-charts";
import type { MonthSummary } from "@/lib/stats";

export function StatsPanels({ summary }: { summary: MonthSummary }) {
  const top = summary.ranked.slice(0, 10);

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
      <section className="border border-line bg-paper xl:col-span-3">
        <h2 className="bg-bark px-3 py-2 text-center text-[13px] font-semibold tracking-[0.14em] text-paper uppercase">
          Overall Stats
        </h2>
        <div className="grid gap-3 p-3 sm:grid-cols-[140px_1fr] xl:grid-cols-1 2xl:grid-cols-[128px_1fr]">
          <div className="flex flex-col gap-2">
            <Score label="Goal" value={summary.goal} />
            <Score label="Completed" value={summary.completed} />
            <Score label="Left" value={summary.left} />
          </div>
          <OverallDonut completed={summary.completed} left={summary.left} percent={summary.percent} />
        </div>
      </section>

      <section className="min-w-0 border border-line bg-paper xl:col-span-6">
        <h2 className="bg-bark px-3 py-2 text-center text-[13px] font-semibold tracking-[0.14em] text-paper uppercase">
          Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-soil text-left text-[11px] tracking-[0.12em] text-paper uppercase">
                <th className="px-3 py-2 font-semibold">Habit</th>
                <th className="px-2 py-2 text-right font-semibold">Goal</th>
                <th className="px-2 py-2 text-right font-semibold">Actual</th>
                <th className="px-2 py-2 text-right font-semibold">Left</th>
                <th className="px-3 py-2 font-semibold">Progress</th>
                <th className="px-3 py-2 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {summary.habitStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-soil">
                    Add a habit to start the month.
                  </td>
                </tr>
              ) : (
                summary.ranked.map((habit, index) => (
                  <tr key={habit.id} className={index % 2 === 0 ? "bg-paper" : "bg-foam"}>
                    <td className="border-t border-line px-3 py-2">
                      <span className="mr-2" aria-hidden="true">
                        {habit.emoji}
                      </span>
                      {habit.name}
                    </td>
                    <td className="border-t border-line px-2 py-2 text-right tabular-nums">{habit.monthGoal}</td>
                    <td className="border-t border-line px-2 py-2 text-right tabular-nums">{habit.actual}</td>
                    <td className="border-t border-line px-2 py-2 text-right tabular-nums">{habit.left}</td>
                    <td className="border-t border-line px-3 py-2">
                      <div className="h-3 border border-line bg-sand">
                        <div
                          className="h-full bg-bar"
                          style={{ width: `${Math.min(100, habit.percent)}%` }}
                        />
                      </div>
                    </td>
                    <td className="border-t border-line px-3 py-2 text-right font-semibold tabular-nums">
                      {Math.round(habit.percent)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-line bg-paper xl:col-span-3">
        <h2 className="bg-bark px-3 py-2 text-center text-[13px] font-semibold tracking-[0.14em] text-paper uppercase">
          Top 10 daily habits
        </h2>
        <ol className="flex flex-col">
          {top.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-soil">Nothing ranked yet.</li>
          ) : (
            top.map((habit, index) => (
              <li
                key={habit.id}
                className="flex items-center gap-3 border-b border-line px-3 py-2 text-sm last:border-b-0"
              >
                <span className="w-5 text-center font-semibold text-soil tabular-nums">{index + 1}</span>
                <span aria-hidden="true">{habit.emoji}</span>
                <span className="min-w-0 flex-1 truncate">{habit.name}</span>
                <span className="font-semibold tabular-nums">{Math.round(habit.percent)}%</span>
              </li>
            ))
          )}
        </ol>
      </section>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line">
      <div className="bg-soil px-2 py-1 text-center text-[11px] font-semibold tracking-[0.16em] text-paper uppercase">
        {label}
      </div>
      <div className="bg-paper py-2 text-center font-display text-3xl text-bark tabular-nums">{value}</div>
    </div>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayStat, WeekStat } from "@/lib/stats";

const BAR = "#7a7266";
const AXIS = "#5c5346";
const GRID = "#e4dccf";

type TooltipPayload = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
};

function PercentTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="border border-line bg-paper px-2 py-1 text-xs text-ink shadow-sm">
      <p className="font-semibold">{label}</p>
      <p className="tabular-nums">{value.toFixed(0)}%</p>
    </div>
  );
}

export function DailyProgressChart({ data }: { data: DayStat[] }) {
  return (
    <section className="flex h-full min-w-0 flex-col border border-line bg-paper">
      <h2 className="bg-bark px-3 py-2 text-center text-[13px] font-semibold tracking-[0.14em] text-paper uppercase">
        Daily Progress
      </h2>
      <div className="h-52 min-h-48 px-1 py-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: AXIS }}
              axisLine={{ stroke: GRID }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: AXIS }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              width={42}
            />
            <Tooltip content={<PercentTooltip />} cursor={{ fill: "rgba(122,114,102,0.12)" }} />
            <Bar dataKey="percent" fill={BAR} maxBarSize={18} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function WeeklyProgressChart({ data }: { data: WeekStat[] }) {
  return (
    <section className="flex h-full min-w-0 flex-col border border-line bg-paper">
      <h2 className="bg-bark px-3 py-2 text-center text-[13px] font-semibold tracking-[0.14em] text-paper uppercase">
        Weekly Progress
      </h2>
      <div className="h-52 min-h-48 px-1 py-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: AXIS }}
              axisLine={{ stroke: GRID }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: AXIS }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              width={42}
            />
            <Tooltip content={<PercentTooltip />} cursor={{ fill: "rgba(122,114,102,0.12)" }} />
            <Bar dataKey="percent" fill={BAR} maxBarSize={36} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function OverallDonut({
  completed,
  left,
  percent,
}: {
  completed: number;
  left: number;
  percent: number;
}) {
  const towardGoal = completed + left === 0 ? 0 : Math.min(completed, completed + left);
  const slices =
    towardGoal + left === 0
      ? [{ name: "Left", value: 1, fill: "#e7e0d2" }]
      : [
          { name: "Completed", value: towardGoal, fill: "#6f6558" },
          { name: "Left", value: left, fill: "#e7e0d2" },
        ].filter((slice) => slice.value > 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={74}
              stroke="#5c5346"
              strokeWidth={1}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[1.7rem] text-bark tabular-nums">{percent.toFixed(1)}%</span>
        </div>
      </div>
      <ul className="flex gap-4 text-xs text-soil">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-clay" />
          Completed
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 border border-line bg-sand" />
          Left
        </li>
      </ul>
    </div>
  );
}

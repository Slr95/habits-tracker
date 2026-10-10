export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Week columns start on Saturday, matching the tracker sheet. */
export const WEEKDAYS = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"] as const;

export type CalendarDay = {
  date: string;
  day: number;
  weekday: (typeof WEEKDAYS)[number];
  weekend: boolean;
};

export type CalendarWeek = {
  index: number;
  days: Array<CalendarDay | null>;
};

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** 0 = Saturday … 6 = Friday */
export function saturdayIndex(date: Date) {
  return (date.getDay() + 1) % 7;
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildMonth(year: number, month: number): CalendarWeek[] {
  const total = daysInMonth(year, month);
  const first = new Date(year, month - 1, 1);
  const cells: Array<CalendarDay | null> = [];

  for (let index = 0; index < saturdayIndex(first); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= total; day += 1) {
    const date = new Date(year, month - 1, day);
    const weekdayIndex = saturdayIndex(date);
    cells.push({
      date: toIsoDate(date),
      day,
      weekday: WEEKDAYS[weekdayIndex],
      weekend: weekdayIndex <= 1,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: CalendarWeek[] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push({
      index: weeks.length + 1,
      days: cells.slice(index, index + 7),
    });
  }
  return weeks;
}

export function monthDays(weeks: CalendarWeek[]) {
  return weeks.flatMap((week) => week.days.filter((day): day is CalendarDay => day !== null));
}

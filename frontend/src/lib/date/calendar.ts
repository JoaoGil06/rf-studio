/**
 * The Monday-first month grid, and the keys everything else joins on.
 *
 * `Date` is parsed and formatted in **local time** throughout. The backend returns
 * `date` as an ISO string with a `Z`; `new Date(iso)` yields a local `Date`, and
 * every key here is built from `getFullYear()`/`getMonth()`/`getDate()`, never from
 * `toISOString()`. Mixing the two is how a 00:30 appointment lands on the previous
 * day for anyone east of Greenwich.
 */

export interface CalendarDay {
  /** `YYYY-MM-DD` in local time — the key everything else joins on. */
  key: string;
  date: Date;
  dayOfMonth: number;
  /** 0 = Sunday, as `Date.getDay()` reports it. */
  weekday: number;
  isOutsideMonth: boolean;
}

export interface MonthRef {
  year: number;
  /** 1-based, as the GraphQL filter wants it. */
  month: number;
}

const MONTH_KEY = /^(\d{4})-(\d{2})$/;
const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

const pad = (value: number) => String(value).padStart(2, '0');

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toMonthKey({ year, month }: MonthRef): string {
  return `${year}-${pad(month)}`;
}

export function monthRefOf(date: Date): MonthRef {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

/** `'2026-09'` → `{ year: 2026, month: 9 }`. Anything else → `null`. */
export function parseMonthKey(value: string | null): MonthRef | null {
  const match = value === null ? null : MONTH_KEY.exec(value);

  if (!match?.[1] || !match[2]) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > MONTHS_PER_YEAR) {
    return null;
  }

  return { year, month };
}

/** `'2026-09-12'` → a local `Date` at midnight. Anything else → `null`. */
export function parseDateKey(value: string | null): Date | null {
  const match = value === null ? null : DAY_KEY.exec(value);

  if (!match?.[1] || !match[2] || !match[3]) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // `new Date(2026, 1, 31)` rolls forward into March rather than throwing, so the
  // only honest check is whether the date that came out is the one that went in.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

/** Wraps the year at the boundaries; `addMonths({2026,12}, 1)` → `{2027,1}`. */
export function addMonths({ year, month }: MonthRef, delta: number): MonthRef {
  const zeroBased = year * MONTHS_PER_YEAR + (month - 1) + delta;

  return {
    year: Math.floor(zeroBased / MONTHS_PER_YEAR),
    month: (zeroBased % MONTHS_PER_YEAR) + 1,
  };
}

/** Monday on or before the 1st, through Sunday on or after the last day. */
export function buildMonthGrid({ year, month }: MonthRef): CalendarDay[] {
  const first = new Date(year, month - 1, 1);
  // The Monday-first offset: `getDay()` counts from Sunday, this counts from Monday.
  const startOffset = (first.getDay() + 6) % DAYS_PER_WEEK;
  const last = new Date(year, month, 0);
  const endOffset = (DAYS_PER_WEEK - 1 - ((last.getDay() + 6) % DAYS_PER_WEEK)) % DAYS_PER_WEEK;
  const total = startOffset + last.getDate() + endOffset;

  const days: CalendarDay[] = [];

  for (let index = 0; index < total; index += 1) {
    const date = new Date(year, month - 1, 1 - startOffset + index);

    days.push({
      key: toDateKey(date),
      date,
      dayOfMonth: date.getDate(),
      weekday: date.getDay(),
      isOutsideMonth: date.getMonth() !== month - 1,
    });
  }

  return days;
}

/** Splits a grid into rows of seven. Throws on a length that is not a multiple of 7. */
export function toWeeks(days: CalendarDay[]): CalendarDay[][] {
  if (days.length % DAYS_PER_WEEK !== 0) {
    throw new Error(`toWeeks: expected a multiple of ${DAYS_PER_WEEK} days, got ${days.length}`);
  }

  const weeks: CalendarDay[][] = [];

  for (let start = 0; start < days.length; start += DAYS_PER_WEEK) {
    weeks.push(days.slice(start, start + DAYS_PER_WEEK));
  }

  return weeks;
}

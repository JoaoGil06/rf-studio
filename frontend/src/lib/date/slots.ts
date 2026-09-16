import { toDateKey } from './calendar';

export interface SlotRangeInput {
  /** Minutes from midnight, inclusive. */
  startMinutes: number;
  /** Minutes from midnight, exclusive. */
  endMinutes: number;
}

const MINUTES_PER_HOUR = 60;

const pad = (value: number) => String(value).padStart(2, '0');

/** Minutes from local midnight. */
export function minutesOfDay(date: Date): number {
  return date.getHours() * MINUTES_PER_HOUR + date.getMinutes();
}

const fromMinutes = (minutes: number) =>
  `${pad(Math.floor(minutes / MINUTES_PER_HOUR))}:${pad(minutes % MINUTES_PER_HOUR)}`;

/** A local `Date` → `'09:30'`. */
export function toSlotKey(date: Date): string {
  return fromMinutes(minutesOfDay(date));
}

/** `[{9*60,12*60},{14*60,18*60}]` at 30 → `['09:00' … '11:30','14:00' … '17:30']`. */
export function buildSlots(ranges: readonly SlotRangeInput[], stepMinutes: number): string[] {
  if (stepMinutes <= 0) {
    return [];
  }

  const slots: string[] = [];

  for (const range of ranges) {
    for (let at = range.startMinutes; at < range.endMinutes; at += stepMinutes) {
      slots.push(fromMinutes(at));
    }
  }

  return slots;
}

/**
 * The studio's grid, plus any time the day actually carries that the grid does not,
 * sorted. `'13:00'` is a real thing Rita can have booked and the ledger does not erase.
 *
 * Sorted lexically on purpose: `'HH:MM'` is zero-padded on both parts, so string
 * order *is* clock order and parsing back to minutes would buy nothing.
 */
export function mergeSlotTimes(gridSlots: readonly string[], actual: readonly string[]): string[] {
  return [...new Set([...gridSlots, ...actual])].sort();
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLOT_KEY = /^(\d{2}):(\d{2})$/;

/**
 * `'2026-09-12'` + `'10:00'` → a local `Date` at that wall-clock hour, or `null`
 * when either half is malformed. Local rather than UTC on purpose: the studio's
 * day is a wall clock, and `toISOString()` on the result round-trips back through
 * `new Date(schedule.date)` to the same hour on the same screen.
 */
export function toLocalDateTime(dateKey: string, slot: string): Date | null {
  const date = DATE_KEY.exec(dateKey);
  const time = SLOT_KEY.exec(slot);

  if (!date || !time) {
    return null;
  }

  const built = new Date(
    Number(date[1]),
    Number(date[2]) - 1,
    Number(date[3]),
    Number(time[1]),
    Number(time[2]),
  );

  // `new Date(2026, 1, 31)` rolls forward to 3 March rather than failing, so the
  // round trip is the check: a key that names a day that does not exist is not one.
  return toDateKey(built) === dateKey && toSlotKey(built) === slot ? built : null;
}

/** A half-open span of the local day, in minutes from midnight: `[start, end)`. */
export interface TimeSpan {
  startMinutes: number;
  endMinutes: number;
}

/** `'09:30'` → `570`, or `null` when the key is malformed. */
export function toMinutes(slot: string): number | null {
  const time = SLOT_KEY.exec(slot);

  return time ? Number(time[1]) * MINUTES_PER_HOUR + Number(time[2]) : null;
}

/**
 * Half-open on both sides, so an appointment ending at 10:00 does not collide
 * with one starting at 10:00 — the chair is free the moment the last one is up.
 */
export function spansOverlap(left: TimeSpan, right: TimeSpan): boolean {
  return left.startMinutes < right.endMinutes && left.endMinutes > right.startMinutes;
}

/**
 * Whether a service of `durationMinutes` starting at `slot` would run into
 * something already on the books.
 *
 * Both directions of the same arithmetic the backend runs in `findOverlapping`:
 * what is already booked occupies its own span, and what is about to be booked
 * needs a span of its own. Closing time is deliberately not consulted — the
 * backend does not enforce the studio's hours either, and an appointment that
 * runs a little past them is Rita's call to make, not the sheet's.
 */
export function isSlotTaken(
  slot: string,
  durationMinutes: number,
  busy: readonly TimeSpan[],
): boolean {
  const startMinutes = toMinutes(slot);

  if (startMinutes === null) {
    return false;
  }

  // Clamped rather than trusted: a zero-length span overlaps nothing and would
  // report every hour of a broken service as free.
  const span = { startMinutes, endMinutes: startMinutes + Math.max(durationMinutes, 1) };

  return busy.some((interval) => spansOverlap(span, interval));
}

const coversMinute = (span: TimeSpan, minute: number) =>
  minute >= span.startMinutes && minute < span.endMinutes;

export function isSlotCovered(slot: string, busy: readonly TimeSpan[]): boolean {
  const startMinutes = toMinutes(slot);

  return startMinutes !== null && busy.some((interval) => coversMinute(interval, startMinutes));
}

/**
 * The grid times a booked appointment runs *through* — its own start included.
 * The day pane reads these: an hour inside someone else's manicure is not `livre`.
 */
export function coveredSlotTimes(
  gridTimes: readonly string[],
  busy: readonly TimeSpan[],
): Set<string> {
  const covered = new Set<string>();

  for (const time of gridTimes) {
    if (isSlotCovered(time, busy)) {
      covered.add(time);
    }
  }

  return covered;
}

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

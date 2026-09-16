import { toDateKey } from '../../../../lib/date/calendar';
import { toMinutes, toSlotKey, type TimeSpan } from '../../../../lib/date/slots';
import { STUDIO_SLOT_MINUTES } from '../../../../utils/constants/studioHours';
import type { ScheduleEntry, ScheduleRecord } from '../../types/agenda.types';

export const isCancelled = (entry: ScheduleEntry) => entry.status === 'cancelled';

/** The ledger does not erase, but cancelled entries do not count as work. */
export const activeOf = (entries: readonly ScheduleEntry[]) =>
  entries.filter((entry) => !isCancelled(entry));

/**
 * The month's schedules by day key. Sorting each bucket once after the pass rather
 * than inserting in order: an insertion sort over a day's entries is O(n²) for a
 * shape that is already grouped.
 */
export function groupSchedulesByDay(
  schedules: readonly ScheduleRecord[],
): Map<string, ScheduleEntry[]> {
  const map = new Map<string, ScheduleEntry[]>();

  for (const schedule of schedules) {
    const date = new Date(schedule.date);
    const key = toDateKey(date);
    const entries = map.get(key) ?? [];

    entries.push({
      id: schedule.id,
      time: toSlotKey(date),
      status: schedule.status,
      finalPrice: schedule.finalPrice,
      durationMinutes: schedule.service.durationMinutes,
    });

    map.set(key, entries);
  }

  for (const entries of map.values()) {
    entries.sort((left, right) => left.time.localeCompare(right.time));
  }

  return map;
}

/** A day outside the month was never fetched, so it is given nothing to show. */
export function entriesOfDay(
  byDay: Map<string, ScheduleEntry[]>,
  key: string,
  isOutsideMonth: boolean,
): readonly ScheduleEntry[] {
  return isOutsideMonth ? [] : (byDay.get(key) ?? []);
}

export function busySpansOf(entries: readonly ScheduleEntry[]): TimeSpan[] {
  const spans: TimeSpan[] = [];

  for (const entry of activeOf(entries)) {
    const startMinutes = toMinutes(entry.time);

    if (startMinutes === null) {
      continue;
    }

    const held = entry.durationMinutes > 0 ? entry.durationMinutes : STUDIO_SLOT_MINUTES;

    spans.push({ startMinutes, endMinutes: startMinutes + held });
  }

  return spans;
}

import type { MonthGridDay } from '../../../../components/CalendarMonthGrid/types/calendarMonthGrid.types';
import type { WeekStripPage } from '../../../../components/CalendarWeekStrip/types/calendarWeekStrip.types';
import {
  monthRefOf,
  parseDateKey,
  toWeeks,
  type CalendarDay,
  type MonthRef,
} from '../../../../lib/date/calendar';
import { formatDayLabel } from '../../../../lib/format/date';
import { AGENDA_COPY, BOOKING_COPY } from '../../../../utils/constants/scheduleMessages';
import { CLOSED_WEEKDAYS } from '../../../../utils/constants/studioHours';
import type { ScheduleEntry } from '../../types/agenda.types';
import { activeOf, entriesOfDay } from './scheduleEntries';

/** Chips a month cell shows before it starts counting the rest. */
const MAX_ENTRIES = 3;
/** State dots a week-strip cell shows. */
const MAX_DOTS = 4;

export const isClosedDay = (weekday: number) => CLOSED_WEEKDAYS.includes(weekday);

/**
 * `sábado, 12 de Setembro — 3 reservas`. One function, because the month cell and the
 * strip cell name the same day and must not describe it two different ways.
 */
export function describeDay(date: Date, isClosed: boolean, activeCount: number): string {
  if (isClosed) {
    return `${formatDayLabel(date)} — ${AGENDA_COPY.closedDayAside}`;
  }

  const noun = activeCount === 1 ? AGENDA_COPY.reservationOne : AGENDA_COPY.reservationMany;

  return `${formatDayLabel(date)} — ${activeCount} ${noun}`;
}

/**
 * `?dia=` is the store, and where it says nothing — or says a day outside the month
 * now on screen, which is what a stale link does — the pane still has to open at
 * *some* day. Today when today is in the month, the 1st otherwise. The phone
 * composition is the reason this is not allowed to be null: there the pane is the page.
 */
export function resolveSelectedDate(dayKey: string | null, month: MonthRef): Date {
  const fromUrl = parseDateKey(dayKey);

  if (
    fromUrl &&
    monthRefOf(fromUrl).month === month.month &&
    fromUrl.getFullYear() === month.year
  ) {
    return fromUrl;
  }

  const today = new Date();

  if (monthRefOf(today).month === month.month && today.getFullYear() === month.year) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  return new Date(month.year, month.month - 1, 1);
}

export function toMonthGridDays(
  grid: readonly CalendarDay[],
  byDay: Map<string, ScheduleEntry[]>,
  todayKey: string,
  selectedKey: string,
): MonthGridDay[] {
  return grid.map((day) => {
    const entries = entriesOfDay(byDay, day.key, day.isOutsideMonth);
    const activeCount = activeOf(entries).length;
    const isClosed = isClosedDay(day.weekday);
    // The prototype's `canAdd`: an outside-month day was never fetched, and
    // the studio is shut on the closed weekdays.
    const canAdd = !day.isOutsideMonth && !isClosed;

    return {
      key: day.key,
      dayOfMonth: day.dayOfMonth,
      isOutsideMonth: day.isOutsideMonth,
      isClosed,
      isToday: day.key === todayKey,
      isSelected: day.key === selectedKey,
      count: activeCount > 0 ? activeCount : null,
      reservationIds: entries.slice(0, MAX_ENTRIES).map((entry) => entry.id),
      overflow: Math.max(0, entries.length - MAX_ENTRIES),
      description: describeDay(day.date, isClosed, activeCount),
      canAdd,
      addLabel: canAdd ? `${BOOKING_COPY.addOn} ${formatDayLabel(day.date)}` : '',
    };
  });
}

export function toWeekStripPages(
  grid: readonly CalendarDay[],
  byDay: Map<string, ScheduleEntry[]>,
  todayKey: string,
  selectedKey: string,
): WeekStripPage[] {
  return toWeeks([...grid]).map((week) => ({
    key: week[0]?.key ?? '',
    days: week.map((day) => {
      const entries = entriesOfDay(byDay, day.key, day.isOutsideMonth);
      const active = activeOf(entries);
      const isClosed = isClosedDay(day.weekday);

      return {
        key: day.key,
        dayOfMonth: day.dayOfMonth,
        isOutsideMonth: day.isOutsideMonth,
        isClosed,
        isToday: day.key === todayKey,
        isSelected: day.key === selectedKey,
        dots: active.slice(0, MAX_DOTS).map((entry) => entry.status),
        description: describeDay(day.date, isClosed, active.length),
      };
    }),
  }));
}

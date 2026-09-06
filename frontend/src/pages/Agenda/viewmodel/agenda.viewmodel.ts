import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MonthGridDay } from '../../../components/CalendarMonthGrid/types/calendarMonthGrid.types';
import type { WeekStripPage } from '../../../components/CalendarWeekStrip/types/calendarWeekStrip.types';
import type { DaySlot } from '../../../components/DayPane/types/dayPane.types';
import {
  addMonths,
  buildMonthGrid,
  monthRefOf,
  parseDateKey,
  parseMonthKey,
  toDateKey,
  toMonthKey,
  toWeeks,
  type MonthRef,
} from '../../../lib/date/calendar';
import { buildSlots, mergeSlotTimes, toSlotKey } from '../../../lib/date/slots';
import { formatDayLabel, formatMonthLabel } from '../../../lib/format/date';
import { formatEuros } from '../../../lib/format/money';
import { SCHEDULE_STATUSES } from '../../../utils/constants/scheduleStatuses';
import { AGENDA_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import {
  CLOSED_WEEKDAYS,
  STUDIO_HOURS,
  STUDIO_SLOT_MINUTES,
} from '../../../utils/constants/studioHours';
import { useAgendaModel } from '../model/agenda.model';
import type { AgendaStats, ScheduleEntry } from '../types/agenda.types';

export const MONTH_PARAM = 'mes';
export const DAY_PARAM = 'dia';

const MAX_ENTRIES = 3;
const MAX_DOTS = 4;

const UNKNOWN_REVENUE = '—';

const isCancelled = (entry: ScheduleEntry) => entry.status === 'cancelled';

/**
 * `sábado, 12 de Setembro — 3 reservas`. One function, because the month cell and the
 * strip cell name the same day and must not describe it two different ways.
 */
function describeDay(date: Date, isClosed: boolean, activeCount: number): string {
  if (isClosed) {
    return `${formatDayLabel(date)} — ${AGENDA_COPY.closedDayAside}`;
  }

  const noun = activeCount === 1 ? AGENDA_COPY.reservationOne : AGENDA_COPY.reservationMany;

  return `${formatDayLabel(date)} — ${activeCount} ${noun}`;
}

export function useAgendaViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Today when the URL says nothing — the only defaulting the month does. It is
   * computed from a real `new Date()` per render, so a session left open across
   * midnight rolls over on the next interaction rather than sticking.
   */
  const month = useMemo(
    () => parseMonthKey(searchParams.get(MONTH_PARAM)) ?? monthRefOf(new Date()),
    [searchParams],
  );

  const { schedules, loading, error } = useAgendaModel(month);

  const grid = useMemo(() => buildMonthGrid(month), [month]);

  /**
   * The selected day is derived, not merely read: `?dia=` is the store, and where it
   * says nothing — or says a day outside the month now on screen, which is what a
   * stale link does — the pane still has to open at *some* day. Today when today is
   * in the month, the 1st otherwise. The phone composition is the reason this is not
   * allowed to be null: there the pane is the page.
   */
  const selectedDate = useMemo(() => {
    const fromUrl = parseDateKey(searchParams.get(DAY_PARAM));

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
  }, [searchParams, month]);

  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  /**
   * The month's schedules by day key. Sorting each bucket once after the pass rather
   * than inserting in order: an insertion sort over a day's entries is O(n²) for a
   * shape that is already grouped.
   */
  const byDay = useMemo(() => {
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
      });

      map.set(key, entries);
    }

    for (const entries of map.values()) {
      entries.sort((left, right) => left.time.localeCompare(right.time));
    }

    return map;
  }, [schedules]);

  const monthDays = useMemo<MonthGridDay[]>(
    () =>
      grid.map((day) => {
        // A day outside the month was never fetched, so it is given nothing to show.
        const entries = day.isOutsideMonth ? [] : (byDay.get(day.key) ?? []);
        const activeCount = entries.filter((entry) => !isCancelled(entry)).length;
        const isClosed = CLOSED_WEEKDAYS.includes(day.weekday);

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
        };
      }),
    [grid, byDay, todayKey, selectedKey],
  );

  const weeks = useMemo<WeekStripPage[]>(
    () =>
      toWeeks(grid).map((week) => ({
        key: week[0]?.key ?? '',
        days: week.map((day) => {
          const entries = day.isOutsideMonth ? [] : (byDay.get(day.key) ?? []);
          const active = entries.filter((entry) => !isCancelled(entry));
          const isClosed = CLOSED_WEEKDAYS.includes(day.weekday);

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
      })),
    [grid, byDay, todayKey, selectedKey],
  );

  const selectedEntries = useMemo(() => byDay.get(selectedKey) ?? [], [byDay, selectedKey]);

  const daySlots = useMemo<DaySlot[]>(() => {
    const times = mergeSlotTimes(
      buildSlots(STUDIO_HOURS, STUDIO_SLOT_MINUTES),
      selectedEntries.map((entry) => entry.time),
    );

    return times.map((time) => ({
      time,
      reservationIds: selectedEntries
        .filter((entry) => entry.time === time)
        .map((entry) => entry.id),
    }));
  }, [selectedEntries]);

  const isSelectedDayClosed = useMemo(
    () => CLOSED_WEEKDAYS.includes(selectedDate.getDay()),
    [selectedDate],
  );

  const dayCountLabel = useMemo(() => {
    if (isSelectedDayClosed) {
      return AGENDA_COPY.closedDayShort;
    }

    const active = selectedEntries.filter((entry) => !isCancelled(entry)).length;

    if (active === 0) {
      return AGENDA_COPY.dayCountNone;
    }

    return active === 1 ? AGENDA_COPY.dayCountOne : `${active} ${AGENDA_COPY.dayCountMany}`;
  }, [isSelectedDayClosed, selectedEntries]);

  const stats = useMemo<AgendaStats>(() => {
    const entries = [...byDay.values()].flat();
    const revenue = entries
      .filter((entry) => entry.status === 'completed')
      .reduce((total, entry) => total + entry.finalPrice, 0);

    return {
      reservations: String(entries.filter((entry) => !isCancelled(entry)).length),
      pending: String(entries.filter((entry) => entry.status === 'pending').length),
      revenue: formatEuros(revenue) ?? UNKNOWN_REVENUE,
    };
  }, [byDay]);

  const monthDate = useMemo(() => new Date(month.year, month.month - 1, 1), [month]);
  const monthLabel = useMemo(() => formatMonthLabel(monthDate), [monthDate]);
  const monthDescription = useMemo(() => `${AGENDA_COPY.whisper} ${monthLabel}`, [monthLabel]);

  const dayLabel = useMemo(() => formatDayLabel(selectedDate), [selectedDate]);

  const goToMonth = useCallback(
    (next: MonthRef) => {
      setSearchParams({ [MONTH_PARAM]: toMonthKey(next) }, { replace: true });
    },
    [setSearchParams],
  );

  const goToPreviousMonth = useCallback(() => goToMonth(addMonths(month, -1)), [goToMonth, month]);
  const goToNextMonth = useCallback(() => goToMonth(addMonths(month, 1)), [goToMonth, month]);

  const selectDay = useCallback(
    (key: string) => {
      setSearchParams({ [MONTH_PARAM]: toMonthKey(month), [DAY_PARAM]: key }, { replace: true });
    },
    [setSearchParams, month],
  );

  const loadError = useMemo(() => (error ? SCHEDULE_ERROR_MESSAGES.load : null), [error]);

  const hasReservations = useMemo(() => schedules.length > 0, [schedules.length]);

  return {
    monthLabel,
    monthDescription,
    goToPreviousMonth,
    goToNextMonth,
    selectDay,
    monthDays,
    weeks,
    selectedKey,
    dayLabel,
    dayCountLabel,
    isSelectedDayClosed,
    daySlots,
    stats,
    statuses: SCHEDULE_STATUSES,
    hasReservations,
    isLoading: loading,
    loadError,
  };
}

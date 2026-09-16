import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addMonths,
  buildMonthGrid,
  monthRefOf,
  parseMonthKey,
  toDateKey,
  toMonthKey,
  type MonthRef,
} from '../../../lib/date/calendar';
import { formatDayLabel, formatMonthLabel } from '../../../lib/format/date';
import { SCHEDULE_STATUSES } from '../../../utils/constants/scheduleStatuses';
import {
  AGENDA_COPY,
  BOOKING_COPY,
  SCHEDULE_ERROR_MESSAGES,
} from '../../../utils/constants/scheduleMessages';
import { useAgendaModel } from '../model/agenda.model';
import {
  isClosedDay,
  resolveSelectedDate,
  toMonthGridDays,
  toWeekStripPages,
} from './helpers/calendarShapes';
import { toBookingDays, toClientOptions, toServiceGroups } from './helpers/bookingShapes';
import { describeDayCount, toDaySlots } from './helpers/dayShapes';
import { toAgendaStats } from './helpers/monthStats';
import { groupSchedulesByDay } from './helpers/scheduleEntries';

export const MONTH_PARAM = 'mes';
export const DAY_PARAM = 'dia';

export function useAgendaViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const month = useMemo(
    () => parseMonthKey(searchParams.get(MONTH_PARAM)) ?? monthRefOf(new Date()),
    [searchParams],
  );

  const { schedules, clients, hasMoreClients, services, loading, error } = useAgendaModel(month);

  const grid = useMemo(() => buildMonthGrid(month), [month]);

  const selectedDate = useMemo(
    () => resolveSelectedDate(searchParams.get(DAY_PARAM), month),
    [searchParams, month],
  );

  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const byDay = useMemo(() => groupSchedulesByDay(schedules), [schedules]);

  const monthDays = useMemo(
    () => toMonthGridDays(grid, byDay, todayKey, selectedKey),
    [grid, byDay, todayKey, selectedKey],
  );

  const weeks = useMemo(
    () => toWeekStripPages(grid, byDay, todayKey, selectedKey),
    [grid, byDay, todayKey, selectedKey],
  );

  const selectedEntries = useMemo(() => byDay.get(selectedKey) ?? [], [byDay, selectedKey]);

  const daySlots = useMemo(() => toDaySlots(selectedEntries), [selectedEntries]);

  const isSelectedDayClosed = useMemo(() => isClosedDay(selectedDate.getDay()), [selectedDate]);

  const dayCountLabel = useMemo(
    () => describeDayCount(isSelectedDayClosed, selectedEntries),
    [isSelectedDayClosed, selectedEntries],
  );

  const clientOptions = useMemo(() => toClientOptions(clients), [clients]);

  const serviceGroups = useMemo(() => toServiceGroups(services), [services]);

  const clientsTruncatedNote = useMemo(
    () => (hasMoreClients ? BOOKING_COPY.clientsTruncated : null),
    [hasMoreClients],
  );

  const bookingDays = useMemo(() => toBookingDays(grid, byDay), [grid, byDay]);

  const selectedBookingDay = useMemo(
    () => bookingDays[selectedKey] ?? null,
    [bookingDays, selectedKey],
  );

  const stats = useMemo(() => toAgendaStats(byDay), [byDay]);

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
    clientOptions,
    serviceGroups,
    clientsTruncatedNote,
    bookingDays,
    selectedBookingDay,
    stats,
    statuses: SCHEDULE_STATUSES,
    hasReservations,
    isLoading: loading,
    loadError,
  };
}

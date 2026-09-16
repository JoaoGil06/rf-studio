import type {
  BookingDay,
  ClientOption,
  ServiceOptionGroup,
} from '../../../../components/BookingForm/types/bookingForm.types';
import type { CalendarDay } from '../../../../lib/date/calendar';
import { formatDayLabel } from '../../../../lib/format/date';
import { formatEuros } from '../../../../lib/format/money';
import { BOOKING_COPY } from '../../../../utils/constants/scheduleMessages';
import { SERVICE_CATEGORIES } from '../../../../utils/constants/serviceCategories';
import type { ClientEdge, ScheduleEntry, ServiceEdge } from '../../types/agenda.types';
import { isClosedDay } from './calendarShapes';
import { busySpansOf } from './scheduleEntries';

export function toClientOptions(clients: readonly ClientEdge[]): readonly ClientOption[] {
  return (
    clients
      .map((edge) => ({ id: edge.node.id, name: edge.node.name }))
      // The backend orders users by `createdAt desc`, which is the wrong order for
      // a name picker. pt-PT collation so `Ângela` sorts with the A's.
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-PT'))
  );
}

export function toServiceGroups(services: readonly ServiceEdge[]): readonly ServiceOptionGroup[] {
  return SERVICE_CATEGORIES.map((category) => ({
    label: category.title,
    options: services
      .filter((edge) => edge.node.category === category.value)
      .map((edge) => ({
        id: edge.node.id,
        // The price is the one thing that tells two similar service names
        // apart, and Rita reads the sheet at arm's length.
        label: `${edge.node.name} · ${formatEuros(edge.node.price) ?? ''}`.trim(),
        durationMinutes: edge.node.durationMinutes,
      })),
  })).filter((group) => group.options.length > 0);
}

/** Keyed by day so the View can index it from a key it already holds. */
export function toBookingDays(
  grid: readonly CalendarDay[],
  byDay: Map<string, ScheduleEntry[]>,
): Record<string, BookingDay> {
  const days: Record<string, BookingDay> = {};

  for (const day of grid) {
    // The prototype's `canAdd`: an outside-month day was never fetched, and the
    // studio is shut on the closed weekdays.
    if (day.isOutsideMonth || isClosedDay(day.weekday)) {
      continue;
    }

    const label = formatDayLabel(day.date);

    days[day.key] = {
      key: day.key,
      label,
      addLabel: `${BOOKING_COPY.addOn} ${label}`,
      busy: busySpansOf(byDay.get(day.key) ?? []),
    };
  }

  return days;
}

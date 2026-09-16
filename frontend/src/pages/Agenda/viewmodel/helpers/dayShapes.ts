import type { DaySlot } from '../../../../components/DayPane/types/dayPane.types';
import { buildSlots, coveredSlotTimes, mergeSlotTimes } from '../../../../lib/date/slots';
import { AGENDA_COPY } from '../../../../utils/constants/scheduleMessages';
import { STUDIO_HOURS, STUDIO_SLOT_MINUTES } from '../../../../utils/constants/studioHours';
import type { ScheduleEntry } from '../../types/agenda.types';
import { activeOf, busySpansOf } from './scheduleEntries';

export function toDaySlots(entries: readonly ScheduleEntry[]): DaySlot[] {
  const times = mergeSlotTimes(
    buildSlots(STUDIO_HOURS, STUDIO_SLOT_MINUTES),
    entries.map((entry) => entry.time),
  );

  const covered = coveredSlotTimes(times, busySpansOf(entries));

  return times.map((time) => {
    const reservationIds = entries.filter((entry) => entry.time === time).map((entry) => entry.id);

    return {
      time,
      reservationIds,
      isCovered: reservationIds.length === 0 && covered.has(time),
    };
  });
}

export function describeDayCount(isClosed: boolean, entries: readonly ScheduleEntry[]): string {
  if (isClosed) {
    return AGENDA_COPY.closedDayShort;
  }

  const active = activeOf(entries).length;

  if (active === 0) {
    return AGENDA_COPY.dayCountNone;
  }

  return active === 1 ? AGENDA_COPY.dayCountOne : `${active} ${AGENDA_COPY.dayCountMany}`;
}

import { useMemo } from 'react';
import { formatSpokenDate } from '../../../lib/format/date';
import { toSlotKey } from '../../../lib/date/slots';
import { SERVICE_CATEGORIES } from '../../../utils/constants/serviceCategories';
import { findScheduleStatus } from '../../../utils/helpers/scheduleStatuses';
import { useReservationEntryModel } from '../model/reservationEntry.model';
import type { EntryDensity, ReservationEntryViewModel } from '../types/reservationEntry.types';

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

export function useReservationEntryViewModel(
  id: string,
  density: EntryDensity,
): ReservationEntryViewModel | null {
  const { reservation } = useReservationEntryModel(id);

  return useMemo(() => {
    if (!reservation) {
      return null;
    }

    const date = new Date(reservation.date);
    const time = toSlotKey(date);
    const status = findScheduleStatus(reservation.status);
    const category = SERVICE_CATEGORIES.find(
      (candidate) => candidate.value === reservation.service.category,
    );

    const lead = status.value === 'pending' ? status.label : (category?.title ?? '');
    const who = [lead, firstName(reservation.user.name)].filter(Boolean).join(' · ');

    return {
      label: density === 'dense' ? `${time} ${who}` : who,
      description: `Reserva de ${formatSpokenDate(date)} às ${time} — ${status.label}, ${reservation.user.name}`,
      statusValue: status.value,
    };
  }, [reservation, density]);
}

import { useMemo } from 'react';
import { toSlotKey } from '../../../lib/date/slots';
import { formatDayMonth, formatSpokenDate } from '../../../lib/format/date';
import { formatEuros } from '../../../lib/format/money';
import { SERVICE_CATEGORIES } from '../../../utils/constants/serviceCategories';
import { findReservationActions } from '../../../utils/helpers/reservationActions';
import { findScheduleStatus } from '../../../utils/helpers/scheduleStatuses';
import { useReservationRowModel } from '../model/reservationRow.model';
import type { ReservationRowViewModel } from '../types/reservationRow.types';

export function useReservationRowViewModel(id: string): ReservationRowViewModel | null {
  const { reservation } = useReservationRowModel(id);

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

    const price = status.value === 'completed' ? formatEuros(reservation.finalPrice) : null;

    const title = [reservation.user.name, category?.title, price].filter(Boolean).join(' · ');

    const spokenWhen = `${formatSpokenDate(date)} às ${time}`;

    const actions = findReservationActions(reservation.status).map((action) => ({
      kind: action.kind,
      label: action.pillLabel,
      accessibleLabel: `${action.accessibleVerb} ${reservation.user.name}, ${spokenWhen}`,
      isDanger: action.tone === 'danger',
    }));

    return {
      statusValue: status.value,
      statusLabel: status.label,
      title,
      serviceName: reservation.service.name,
      when: `${formatDayMonth(date, new Date().getFullYear())} · ${time}`,
      description: `${status.label} — ${title}, ${reservation.service.name}, ${spokenWhen}`,
      actions,
    };
  }, [reservation]);
}

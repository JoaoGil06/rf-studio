import { useCallback, useMemo } from 'react';
import { isBadUserInput, isServerRejection } from '../../../graphql/errors';
import { toSlotKey } from '../../../lib/date/slots';
import { formatDayMonth } from '../../../lib/format/date';
import {
  RESERVATION_ACTIONS,
  type ReservationActionKind,
} from '../../../utils/constants/reservationActions';
import { SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { useReservationStatusModalModel } from '../model/reservationStatusModal.model';
import type { ReservationStatusModalViewModel } from '../types/reservationStatusModal.types';

export function useReservationStatusModalViewModel(
  scheduleId: string | null,
  kind: ReservationActionKind | null,
): ReservationStatusModalViewModel {
  const { reservation, updateStatus, isUpdating } = useReservationStatusModalModel(scheduleId);

  const action = useMemo(() => RESERVATION_ACTIONS[kind ?? 'confirm'], [kind]);

  const subject = useMemo(() => {
    if (!reservation || !kind) {
      return null;
    }

    const date = new Date(reservation.date);
    return `${reservation.user.name}, ${formatDayMonth(date, new Date().getFullYear())} às ${toSlotKey(date)}`;
  }, [reservation, kind]);

  const confirm = useCallback(async (): Promise<string | null> => {
    if (!scheduleId || !kind) {
      return SCHEDULE_ERROR_MESSAGES.statusFailed;
    }

    try {
      const { data: result } = await updateStatus({
        variables: { input: { id: scheduleId, status: action.targetStatus } },
      });

      if (!result) {
        return SCHEDULE_ERROR_MESSAGES.network;
      }

      switch (result.updateSchedule.__typename) {
        case 'UpdateScheduleSuccess':
          return null;

        case 'ScheduleNotFoundError':
          return SCHEDULE_ERROR_MESSAGES.notFound;

        case 'ServiceNotFoundError':
          return SCHEDULE_ERROR_MESSAGES.serviceNotFound;

        case 'ScheduleAlreadyBookedError':
          return SCHEDULE_ERROR_MESSAGES.statusChanged;
      }
    } catch (mutationError) {
      if (isBadUserInput(mutationError)) {
        return SCHEDULE_ERROR_MESSAGES.badInput;
      }

      if (isServerRejection(mutationError)) {
        return SCHEDULE_ERROR_MESSAGES.statusFailed;
      }

      return SCHEDULE_ERROR_MESSAGES.network;
    }
  }, [updateStatus, scheduleId, kind, action.targetStatus]);

  return {
    subject,
    title: action.title,
    verb: action.verb,
    consequence: action.consequence,
    keepLabel: action.keepLabel,
    actLabel: action.actLabel,
    tone: action.tone,
    isUpdating,
    confirm,
  };
}

import type { ScheduleStatus } from '../../graphql/generated/graphql';
import {
  RESERVATION_ACTIONS,
  RESERVATION_ACTIONS_BY_STATUS,
  type ReservationActionDescriptor,
} from '../constants/reservationActions';

const NONE: readonly ReservationActionDescriptor[] = [];

function isKnownStatus(status: string): status is ScheduleStatus {
  return Object.hasOwn(RESERVATION_ACTIONS_BY_STATUS, status);
}

export function findReservationActions(status: string): readonly ReservationActionDescriptor[] {
  if (!isKnownStatus(status)) {
    return NONE;
  }

  return RESERVATION_ACTIONS_BY_STATUS[status].map((kind) => RESERVATION_ACTIONS[kind]);
}

import type { ScheduleStatus } from '../../graphql/generated/graphql';
import {
  RESERVATION_ACTION_PILLS,
  RESERVATION_ACTIONS_BY_STATUS,
  type ReservationActionPill,
} from '../constants/reservationActions';

const NONE: readonly ReservationActionPill[] = [];

function isKnownStatus(status: string): status is ScheduleStatus {
  return Object.hasOwn(RESERVATION_ACTIONS_BY_STATUS, status);
}

export function findReservationActions(status: string): readonly ReservationActionPill[] {
  if (!isKnownStatus(status)) {
    return NONE;
  }

  return RESERVATION_ACTIONS_BY_STATUS[status].map((kind) => RESERVATION_ACTION_PILLS[kind]);
}

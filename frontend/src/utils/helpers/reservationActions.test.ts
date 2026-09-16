import { RESERVATION_ACTIONS } from '../constants/reservationActions';
import { findReservationActions } from './reservationActions';

/**
 * A literal copy of `ScheduleStatusService.TRANSICTIONS` in the backend. If the two
 * drift, the table-driven test below says so before Rita meets a refused mutation.
 */
const BACKEND_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

describe('findReservationActions', () => {
  it('offers confirm then cancel on a pending reservation', () => {
    const actions = findReservationActions('pending');

    expect(actions.map((action) => action.kind)).toEqual(['confirm', 'cancel']);
    expect(actions[0]).toBe(RESERVATION_ACTIONS.confirm);
    expect(actions[1]).toBe(RESERVATION_ACTIONS.cancel);
  });

  it('offers only cancel on a confirmed reservation — completing has its own mutation', () => {
    expect(findReservationActions('confirmed').map((action) => action.kind)).toEqual(['cancel']);
  });

  it.each(['completed', 'cancelled'])('offers nothing on a %s reservation', (status) => {
    expect(findReservationActions(status)).toEqual([]);
  });

  it.each(['no-show', 'toString', ''])(
    'offers nothing on a status the app does not know (%j)',
    (status) => {
      expect(findReservationActions(status)).toEqual([]);
    },
  );

  it.each(Object.keys(BACKEND_TRANSITIONS))(
    'only offers transitions the backend accepts from %s',
    (status) => {
      for (const action of findReservationActions(status)) {
        expect(BACKEND_TRANSITIONS[status]).toContain(action.targetStatus);
      }
    },
  );
});

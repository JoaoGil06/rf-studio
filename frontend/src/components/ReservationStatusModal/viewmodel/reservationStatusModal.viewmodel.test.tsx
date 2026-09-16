import { CombinedGraphQLErrors } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import {
  RESERVATION_ACTIONS,
  type ReservationActionKind,
} from '../../../utils/constants/reservationActions';
import { SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { useReservationStatusModalViewModel } from './reservationStatusModal.viewmodel';

const updateStatusMock = vi.fn();
const reservationMock = vi.fn();

vi.mock('../model/reservationStatusModal.model', () => ({
  useReservationStatusModalModel: (scheduleId: string | null) => ({
    reservation: reservationMock(scheduleId),
    updateStatus: updateStatusMock,
    isUpdating: false,
  }),
}));

function aReservation(overrides: Record<string, unknown> = {}) {
  return {
    id: 's1',
    status: 'pending',
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    user: { id: 'client-1', name: 'Maria Silva' },
    ...overrides,
  };
}

function aPayload(updateSchedule: Record<string, unknown>) {
  return { data: { updateSchedule } };
}

function renderViewModel(
  scheduleId: string | null = 's1',
  kind: ReservationActionKind | null = 'confirm',
) {
  return renderHook(() => useReservationStatusModalViewModel(scheduleId, kind));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 16));
  reservationMock.mockImplementation((id: string | null) => (id ? aReservation({ id }) : null));
  updateStatusMock.mockResolvedValue(aPayload({ __typename: 'UpdateScheduleSuccess' }));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useReservationStatusModalViewModel — what the dialog is handed', () => {
  it('names the client together with the day and hour', () => {
    expect(renderViewModel().result.current.subject).toBe('Maria Silva, 12 Setembro às 10:00');
  });

  it('carries the year when the reservation is not in this one', () => {
    reservationMock.mockReturnValue(
      aReservation({ date: new Date(2025, 8, 12, 10, 0).toISOString() }),
    );

    expect(renderViewModel().result.current.subject).toBe('Maria Silva, 12 Setembro 2025 às 10:00');
  });

  it('has nothing to ask about while the fragment is missing', () => {
    reservationMock.mockReturnValue(null);

    expect(renderViewModel().result.current.subject).toBeNull();
  });

  it('has nothing to ask about while no reservation is chosen', () => {
    expect(renderViewModel(null).result.current.subject).toBeNull();
  });

  it('has nothing to ask about while no action is chosen', () => {
    expect(renderViewModel('s1', null).result.current.subject).toBeNull();
  });

  it.each(['confirm', 'cancel'] as const)(
    "hands over the %s descriptor's copy and tone",
    (kind) => {
      const { result } = renderViewModel('s1', kind);
      const action = RESERVATION_ACTIONS[kind];

      expect(result.current).toMatchObject({
        title: action.title,
        verb: action.verb,
        consequence: action.consequence,
        keepLabel: action.keepLabel,
        actLabel: action.actLabel,
        tone: action.tone,
      });
    },
  );

  it('confirms with the primary button and cancels with the destructive pill', () => {
    expect(renderViewModel('s1', 'confirm').result.current.tone).toBe('primary');
    expect(renderViewModel('s1', 'cancel').result.current.tone).toBe('danger');
  });
});

describe('useReservationStatusModalViewModel — confirming', () => {
  it.each([
    ['confirm', 'confirmed'],
    ['cancel', 'cancelled'],
  ] as const)('asks to %s by sending the %s status', async (kind, status) => {
    await renderViewModel('s1', kind).result.current.confirm();

    expect(updateStatusMock).toHaveBeenCalledWith({
      variables: { input: { id: 's1', status } },
    });
  });

  it('reports success as the absence of a failure', async () => {
    expect(await renderViewModel().result.current.confirm()).toBeNull();
  });

  it('says the reservation is gone when the server cannot find it', async () => {
    updateStatusMock.mockResolvedValue(
      aPayload({ __typename: 'ScheduleNotFoundError', message: 'Schedule not found: s1' }),
    );

    expect(await renderViewModel().result.current.confirm()).toBe(SCHEDULE_ERROR_MESSAGES.notFound);
  });

  it('says the service is gone when the server says so', async () => {
    updateStatusMock.mockResolvedValue(
      aPayload({ __typename: 'ServiceNotFoundError', message: 'Service not found' }),
    );

    expect(await renderViewModel().result.current.confirm()).toBe(
      SCHEDULE_ERROR_MESSAGES.serviceNotFound,
    );
  });

  it('reads a refused transition as a state that already changed — not as a taken hour', async () => {
    updateStatusMock.mockResolvedValue(
      aPayload({
        __typename: 'ScheduleAlreadyBookedError',
        message: 'Invalid schedule status transition: cancelled -> confirmed',
      }),
    );

    const failure = await renderViewModel().result.current.confirm();

    expect(failure).toBe(SCHEDULE_ERROR_MESSAGES.statusChanged);
    expect(failure).not.toBe(SCHEDULE_ERROR_MESSAGES.alreadyBooked);
  });

  it('returns the connection copy when no data came back', async () => {
    updateStatusMock.mockResolvedValue({ data: undefined });

    expect(await renderViewModel().result.current.confirm()).toBe(SCHEDULE_ERROR_MESSAGES.network);
  });

  it('returns the input copy when the server rejects the input', async () => {
    updateStatusMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'invalid uuid', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );

    expect(await renderViewModel().result.current.confirm()).toBe(SCHEDULE_ERROR_MESSAGES.badInput);
  });

  it('returns the generic failure, never the Apollo message, on any other server error', async () => {
    updateStatusMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'boom', extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
      }),
    );

    expect(await renderViewModel().result.current.confirm()).toBe(
      SCHEDULE_ERROR_MESSAGES.statusFailed,
    );
  });

  it('returns the connection copy when the request never reached the server', async () => {
    updateStatusMock.mockRejectedValue(new Error('Failed to fetch'));

    expect(await renderViewModel().result.current.confirm()).toBe(SCHEDULE_ERROR_MESSAGES.network);
  });

  it('sends nothing when there is no reservation or no action', async () => {
    expect(await renderViewModel(null).result.current.confirm()).toBe(
      SCHEDULE_ERROR_MESSAGES.statusFailed,
    );
    expect(await renderViewModel('s1', null).result.current.confirm()).toBe(
      SCHEDULE_ERROR_MESSAGES.statusFailed,
    );
    expect(updateStatusMock).not.toHaveBeenCalled();
  });
});

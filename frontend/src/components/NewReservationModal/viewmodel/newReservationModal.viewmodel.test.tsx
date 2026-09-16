import { CombinedGraphQLErrors } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import type { BookingDay, ServiceOptionGroup } from '../../BookingForm/types/bookingForm.types';
import { useNewReservationModalViewModel } from './newReservationModal.viewmodel';

const registerScheduleMock = vi.fn();

vi.mock('../model/newReservationModal.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/newReservationModal.model')>()),
  useNewReservationModalModel: () => ({
    registerSchedule: registerScheduleMock,
    isSaving: false,
  }),
}));

const SATURDAY: BookingDay = {
  key: '2026-09-12',
  label: 'sábado, 12 de Setembro',
  addLabel: 'Nova reserva em sábado, 12 de Setembro',
  busy: [],
};

const SERVICE_GROUPS: ServiceOptionGroup[] = [
  {
    label: 'Unhas',
    options: [
      { id: 's1', label: 'Manicure · 15,00 €', durationMinutes: 30 },
      { id: 's2', label: 'Gelinho · 30,00 €', durationMinutes: 90 },
    ],
  },
];

const payload = (arm: Record<string, unknown>) => ({ data: { registerSchedule: arm } });

const successPayload = payload({
  __typename: 'RegisterScheduleSuccess',
  schedule: { __typename: 'Schedule', id: 'schedule-1' },
});

const submitResultMock = vi.fn();

function Harness({ day }: { day: BookingDay | null }) {
  const { register, handleSubmit, submit, resetForm, formError, errors, slots, isTimeLocked } =
    useNewReservationModalViewModel(day, SERVICE_GROUPS);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="form-error">{formError ?? ''}</span>
      <span data-testid="time-error">{errors.time?.message ?? ''}</span>
      <span data-testid="time-locked">{String(isTimeLocked)}</span>
      <ul data-testid="slots">
        {slots.map((slot) => (
          <li key={slot.time} data-time={slot.time} data-taken={String(slot.isTaken)} />
        ))}
      </ul>

      <select aria-label="hora" {...register('time')}>
        <option value="">—</option>
        <option value="10:00">10:00</option>
        <option value="11:30">11:30</option>
      </select>
      <select aria-label="cliente" {...register('userId')}>
        <option value="">—</option>
        <option value="c1">Ana</option>
      </select>
      <select aria-label="servico" {...register('serviceId')}>
        <option value="">—</option>
        <option value="s1">Manicure</option>
        <option value="s2">Gelinho</option>
      </select>

      <button type="button" onClick={resetForm}>
        limpar
      </button>
      <button type="submit">criar</button>
    </form>
  );
}

async function bookTenOclock(day: BookingDay | null = SATURDAY) {
  const user = userEvent.setup();
  render(<Harness day={day} />);

  await user.selectOptions(screen.getByLabelText('hora'), '10:00');
  await user.selectOptions(screen.getByLabelText('cliente'), 'c1');
  await user.selectOptions(screen.getByLabelText('servico'), 's1');
  await user.click(screen.getByRole('button', { name: 'criar' }));

  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
  registerScheduleMock.mockResolvedValue(successPayload);
});

describe('useNewReservationModalViewModel — what it sends', () => {
  it('sends the day and the chosen hour as one local instant, at the pending status', async () => {
    await bookTenOclock();

    const input = registerScheduleMock.mock.calls[0]?.[0].variables.input;

    expect(input.userId).toBe('c1');
    expect(input.serviceId).toBe('s1');
    expect(input.status).toBe('pending');
    expect(new Date(input.date)).toEqual(new Date(2026, 8, 12, 10, 0));
  });

  it('reports success without touching any UI state', async () => {
    await bookTenOclock();

    expect(submitResultMock).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('form-error')).toHaveTextContent('');
  });

  it('refuses to book, and does not report success, when the day is null', async () => {
    await bookTenOclock(null);

    expect(registerScheduleMock).not.toHaveBeenCalled();
    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.badInput);
  });

  it('refuses an hour the day cannot hold rather than sending an invalid instant', async () => {
    await bookTenOclock({ ...SATURDAY, key: '2026-02-31' });

    expect(registerScheduleMock).not.toHaveBeenCalled();
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });
});

describe('useNewReservationModalViewModel — the four arms of the payload', () => {
  it('maps ScheduleAlreadyBookedError to the pt-PT overlap message', async () => {
    registerScheduleMock.mockResolvedValue(
      payload({ __typename: 'ScheduleAlreadyBookedError', message: 'Already booked' }),
    );

    await bookTenOclock();

    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error')).toHaveTextContent(
      SCHEDULE_ERROR_MESSAGES.alreadyBooked,
    );
  });

  it('maps UserNotFoundError to its own message', async () => {
    registerScheduleMock.mockResolvedValue(
      payload({ __typename: 'UserNotFoundError', message: 'User not found' }),
    );

    await bookTenOclock();

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      SCHEDULE_ERROR_MESSAGES.clientNotFound,
    );
  });

  it('maps ServiceNotFoundError to its own message', async () => {
    registerScheduleMock.mockResolvedValue(
      payload({ __typename: 'ServiceNotFoundError', message: 'Service not found' }),
    );

    await bookTenOclock();

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      SCHEDULE_ERROR_MESSAGES.serviceNotFound,
    );
  });

  it('treats a missing payload as a transport failure', async () => {
    registerScheduleMock.mockResolvedValue({ data: undefined });

    await bookTenOclock();

    expect(screen.getByTestId('form-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.network);
  });
});

describe('useNewReservationModalViewModel — a rejected mutation', () => {
  it('maps a BAD_USER_INPUT rejection to the input message', async () => {
    registerScheduleMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [{ message: 'bad', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );

    await bookTenOclock();

    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.badInput);
  });

  it('maps anything else to the network message', async () => {
    registerScheduleMock.mockRejectedValue(new Error('offline'));

    await bookTenOclock();

    expect(screen.getByTestId('form-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.network);
  });
});

describe('useNewReservationModalViewModel — resetting', () => {
  it('empties the three fields when the View asks it to', async () => {
    const user = await bookTenOclock();

    await user.click(screen.getByRole('button', { name: 'limpar' }));

    expect(screen.getByLabelText('hora')).toHaveValue('');
    expect(screen.getByLabelText('cliente')).toHaveValue('');
    expect(screen.getByLabelText('servico')).toHaveValue('');
  });
});

function slotAt(time: string) {
  return screen.getByTestId('slots').querySelector(`[data-time="${time}"]`);
}

describe('useNewReservationModalViewModel — the hours it offers', () => {
  it('offers none of them until a service says how long the chair is needed', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    expect(screen.getByTestId('time-locked')).toHaveTextContent('true');
    expect(screen.getByTestId('slots')).toBeEmptyDOMElement();

    await user.selectOptions(screen.getByLabelText('servico'), 's1');

    expect(screen.getByTestId('time-locked')).toHaveTextContent('false');
    expect(slotAt('09:00')).toBeInTheDocument();
  });

  it('takes every hour an appointment already on the books runs through', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 600, endMinutes: 690 }] }} />);

    await user.selectOptions(screen.getByLabelText('servico'), 's1');

    for (const time of ['10:00', '10:30', '11:00']) {
      expect(slotAt(time)).toHaveAttribute('data-taken', 'true');
    }

    expect(slotAt('11:30')).toHaveAttribute('data-taken', 'false');
  });

  it('offers an hour that runs past closing, since studio hours are not the rule', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.selectOptions(screen.getByLabelText('servico'), 's2');

    expect(slotAt('11:30')).toHaveAttribute('data-taken', 'false');
    expect(slotAt('22:00')).toHaveAttribute('data-taken', 'false');
  });

  it('re-reads the day when the service changes rather than keeping the first answer', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 660, endMinutes: 690 }] }} />);

    await user.selectOptions(screen.getByLabelText('servico'), 's1');

    expect(slotAt('10:00')).toHaveAttribute('data-taken', 'false');

    await user.selectOptions(screen.getByLabelText('servico'), 's2');

    expect(slotAt('10:00')).toHaveAttribute('data-taken', 'true');
  });
});

describe('useNewReservationModalViewModel — an hour that stopped fitting', () => {
  it('refuses a chosen hour a reservation has since grown into', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 630, endMinutes: 660 }] }} />);

    await user.selectOptions(screen.getByLabelText('servico'), 's1');
    await user.selectOptions(screen.getByLabelText('hora'), '10:00');
    await user.selectOptions(screen.getByLabelText('cliente'), 'c1');
    await user.selectOptions(screen.getByLabelText('servico'), 's2');
    await user.click(screen.getByRole('button', { name: 'criar' }));

    expect(registerScheduleMock).not.toHaveBeenCalled();
    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('time-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.timeTaken);
  });
});

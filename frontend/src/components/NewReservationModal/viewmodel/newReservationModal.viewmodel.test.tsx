import { CombinedGraphQLErrors } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BOOKING_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import type { BookingDay, ServiceOptionGroup } from '../../BookingForm/types/bookingForm.types';
import { useNewReservationModalViewModel } from './newReservationModal.viewmodel';

const registerScheduleMock = vi.fn();

vi.mock('../model/newReservationModal.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/newReservationModal.model')>()),
  useNewReservationModalModel: () => ({
    registerSchedule: registerScheduleMock,
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
      { id: 's1', label: 'Manicure · 15,00 €', durationMinutes: 30, price: 15 },
      { id: 's2', label: 'Gelinho · 30,00 €', durationMinutes: 90, price: 30 },
    ],
  },
  {
    label: 'Sobrancelhas',
    options: [{ id: 's3', label: 'Design · 10,00 €', durationMinutes: 45, price: 10 }],
  },
  {
    label: 'Sem duração',
    options: [{ id: 's4', label: 'Avulso · 5,00 €', durationMinutes: 0, price: 5 }],
  },
];

const SERVICE_IDS = ['s1', 's2', 's3', 's4'];

const payload = (arm: Record<string, unknown>) => ({ data: { registerSchedule: arm } });

const successPayload = payload({
  __typename: 'RegisterScheduleSuccess',
  schedule: { __typename: 'Schedule', id: 'schedule-1' },
});

const submitResultMock = vi.fn();

function Harness({ day }: { day: BookingDay | null }) {
  const {
    register,
    handleSubmit,
    submit,
    resetForm,
    formError,
    errors,
    slots,
    isTimeLocked,
    availableGroups,
    chosenServices,
    serviceSummary,
    submitLabel,
    addService,
    removeService,
  } = useNewReservationModalViewModel(day, SERVICE_GROUPS);

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
          <li
            key={slot.time}
            data-time={slot.time}
            data-taken={String(slot.isTaken)}
            data-label={slot.label}
          />
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
      <span data-testid="service-error">{errors.serviceIds?.message ?? ''}</span>
      <span data-testid="summary">{serviceSummary ?? ''}</span>
      <span data-testid="submit-label">{submitLabel}</span>
      <span data-testid="chosen">{chosenServices.map((option) => option.id).join(',')}</span>
      <span data-testid="groups">
        {availableGroups
          .map((group) => `${group.label}:${group.options.map((option) => option.id).join('+')}`)
          .join('|')}
      </span>
      {SERVICE_IDS.map((id) => (
        <button key={`add-${id}`} type="button" onClick={() => addService(id)}>
          {`adicionar ${id}`}
        </button>
      ))}
      {SERVICE_IDS.map((id) => (
        <button key={`remove-${id}`} type="button" onClick={() => removeService(id)}>
          {`remover ${id}`}
        </button>
      ))}

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
  await user.click(screen.getByRole('button', { name: 'adicionar s1' }));
  await user.click(screen.getByRole('button', { name: 'criar' }));

  return user;
}

/** Fills the sheet with `serviceIds`, in order, at ten o'clock, and submits it. */
async function bookChain(serviceIds: readonly string[], day: BookingDay = SATURDAY) {
  const user = userEvent.setup();
  render(<Harness day={day} />);

  for (const id of serviceIds) {
    await user.click(screen.getByRole('button', { name: `adicionar ${id}` }));
  }

  await user.selectOptions(screen.getByLabelText('hora'), '10:00');
  await user.selectOptions(screen.getByLabelText('cliente'), 'c1');
  await user.click(screen.getByRole('button', { name: 'criar' }));

  return user;
}

const sentInput = (call: number) => registerScheduleMock.mock.calls[call]?.[0].variables.input;

const alreadyBookedPayload = payload({
  __typename: 'ScheduleAlreadyBookedError',
  message: 'Already booked',
});

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
    expect(screen.getByTestId('chosen')).toBeEmptyDOMElement();
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

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(screen.getByTestId('time-locked')).toHaveTextContent('false');
    expect(slotAt('09:00')).toBeInTheDocument();
  });

  it('takes every hour an appointment already on the books runs through', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 600, endMinutes: 690 }] }} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    for (const time of ['10:00', '10:30', '11:00']) {
      expect(slotAt(time)).toHaveAttribute('data-taken', 'true');
    }

    expect(slotAt('11:30')).toHaveAttribute('data-taken', 'false');
  });

  it('offers the lunch hours like any other', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    for (const time of ['12:00', '12:30', '13:00', '13:30']) {
      expect(slotAt(time)).toHaveAttribute('data-taken', 'false');
      expect(slotAt(time)).toHaveAttribute('data-label', time);
    }
  });

  it('calls an hour inside an appointment its continuation', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 600, endMinutes: 690 }] }} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    for (const time of ['10:00', '10:30', '11:00']) {
      expect(slotAt(time)).toHaveAttribute('data-label', `${time} — ${BOOKING_COPY.coveredSuffix}`);
    }
  });

  it('calls a free hour the service does not fit into before the next one “sem tempo”', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 600, endMinutes: 630 }] }} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));

    for (const time of ['09:00', '09:30']) {
      expect(slotAt(time)).toHaveAttribute('data-taken', 'true');
      expect(slotAt(time)).toHaveAttribute('data-label', `${time} — ${BOOKING_COPY.noTimeSuffix}`);
    }
    expect(slotAt('10:00')).toHaveAttribute('data-label', `10:00 — ${BOOKING_COPY.coveredSuffix}`);
    expect(slotAt('10:30')).toHaveAttribute('data-label', '10:30');
  });

  it('offers an hour that runs past closing, since studio hours are not the rule', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));

    expect(slotAt('11:30')).toHaveAttribute('data-taken', 'false');
    expect(slotAt('22:00')).toHaveAttribute('data-taken', 'false');
  });

  it('re-reads the day when a service is added rather than keeping the first answer', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 660, endMinutes: 690 }] }} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(slotAt('10:00')).toHaveAttribute('data-taken', 'false');

    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));

    expect(slotAt('10:00')).toHaveAttribute('data-taken', 'true');
  });
});

describe('useNewReservationModalViewModel — an hour that stopped fitting', () => {
  it('refuses a chosen hour a reservation has since grown into', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 630, endMinutes: 660 }] }} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));
    await user.selectOptions(screen.getByLabelText('hora'), '10:00');
    await user.selectOptions(screen.getByLabelText('cliente'), 'c1');
    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));
    await user.click(screen.getByRole('button', { name: 'criar' }));

    expect(registerScheduleMock).not.toHaveBeenCalled();
    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('time-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.timeTaken);
  });
});

describe('useNewReservationModalViewModel — booking several services', () => {
  it('creates one pending reservation per service, in the order chosen', async () => {
    await bookChain(['s2', 's1']);

    expect(registerScheduleMock).toHaveBeenCalledTimes(2);
    expect(sentInput(0).serviceId).toBe('s2');
    expect(sentInput(1).serviceId).toBe('s1');
    expect(sentInput(0).status).toBe('pending');
    expect(sentInput(1).status).toBe('pending');
  });

  it('starts each service when the previous one ends', async () => {
    await bookChain(['s2', 's1']);

    expect(new Date(sentInput(0).date)).toEqual(new Date(2026, 8, 12, 10, 0));
    expect(new Date(sentInput(1).date)).toEqual(new Date(2026, 8, 12, 11, 30));
  });

  it('starts the next service after the fallback when a duration is invalid', async () => {
    await bookChain(['s4', 's1']);

    expect(new Date(sentInput(1).date)).toEqual(new Date(2026, 8, 12, 10, 30));
  });

  it('sends the same client on every reservation', async () => {
    await bookChain(['s1', 's2', 's3']);

    expect(registerScheduleMock).toHaveBeenCalledTimes(3);

    for (const call of [0, 1, 2]) {
      expect(sentInput(call).userId).toBe('c1');
    }
  });

  it('reports success only after the last one lands', async () => {
    let finishSecond: (value: unknown) => void = () => {};

    registerScheduleMock.mockResolvedValueOnce(successPayload).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishSecond = resolve;
        }),
    );

    await bookChain(['s1', 's2']);

    expect(registerScheduleMock).toHaveBeenCalledTimes(2);
    expect(submitResultMock).not.toHaveBeenCalled();

    finishSecond(successPayload);

    await waitFor(() => expect(submitResultMock).toHaveBeenCalledWith(true));
  });

  it('offers an hour only if the whole block fits', async () => {
    const user = userEvent.setup();
    render(<Harness day={{ ...SATURDAY, busy: [{ startMinutes: 660, endMinutes: 690 }] }} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(slotAt('10:00')).toHaveAttribute('data-taken', 'false');

    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));

    expect(slotAt('10:00')).toHaveAttribute('data-taken', 'true');
  });

  it('refuses a chosen hour that a later added service no longer fits', async () => {
    await bookChain(['s1', 's2'], { ...SATURDAY, busy: [{ startMinutes: 660, endMinutes: 690 }] });

    expect(registerScheduleMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('time-error')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.timeTaken);
  });
});

describe('useNewReservationModalViewModel — when one of them fails', () => {
  it('books nothing further and shows the plain message when the first fails', async () => {
    registerScheduleMock.mockResolvedValue(alreadyBookedPayload);

    await bookChain(['s1', 's2']);

    expect(registerScheduleMock).toHaveBeenCalledTimes(1);
    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('form-error').textContent).toBe(
      SCHEDULE_ERROR_MESSAGES.alreadyBooked,
    );
    expect(screen.getByTestId('chosen')).toHaveTextContent('s1,s2');
    expect(screen.getByLabelText('hora')).toHaveValue('10:00');
  });

  it('stops at the failure and keeps only the unbooked services', async () => {
    registerScheduleMock
      .mockResolvedValueOnce(successPayload)
      .mockResolvedValueOnce(alreadyBookedPayload);

    await bookChain(['s1', 's2', 's3']);

    expect(registerScheduleMock).toHaveBeenCalledTimes(2);
    expect(submitResultMock).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('chosen')).toHaveTextContent('s2,s3');
  });

  it('clears the hour and says how far it got', async () => {
    registerScheduleMock
      .mockResolvedValueOnce(successPayload)
      .mockResolvedValueOnce(alreadyBookedPayload);

    await bookChain(['s1', 's2']);

    expect(screen.getByLabelText('hora')).toHaveValue('');
    expect(screen.getByTestId('form-error')).toHaveTextContent(
      BOOKING_COPY.partialBooking(1, 2, SCHEDULE_ERROR_MESSAGES.alreadyBooked),
    );
  });

  it('does not resend what was booked on retry', async () => {
    registerScheduleMock
      .mockResolvedValueOnce(successPayload)
      .mockResolvedValueOnce(alreadyBookedPayload);

    const user = await bookChain(['s1', 's2']);

    registerScheduleMock.mockClear();
    registerScheduleMock.mockResolvedValue(successPayload);

    await user.selectOptions(screen.getByLabelText('hora'), '11:30');
    await user.click(screen.getByRole('button', { name: 'criar' }));

    expect(registerScheduleMock).toHaveBeenCalledTimes(1);
    expect(sentInput(0).serviceId).toBe('s2');
    expect(new Date(sentInput(0).date)).toEqual(new Date(2026, 8, 12, 11, 30));
    expect(screen.getByTestId('form-error')).toBeEmptyDOMElement();
  });

  it('reports a thrown error partway through as a partial booking too', async () => {
    registerScheduleMock
      .mockResolvedValueOnce(successPayload)
      .mockRejectedValueOnce(new Error('offline'));

    await bookChain(['s1', 's2']);

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      BOOKING_COPY.partialBooking(1, 2, SCHEDULE_ERROR_MESSAGES.network),
    );
    expect(screen.getByTestId('chosen')).toHaveTextContent('s2');
  });
});

describe('useNewReservationModalViewModel — choosing services', () => {
  it('removes a chosen service from the groups and drops an emptied group', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));
    await user.click(screen.getByRole('button', { name: 'adicionar s3' }));

    expect(screen.getByTestId('groups')).toHaveTextContent('Unhas:s2|Sem duração:s4');

    await user.click(screen.getByRole('button', { name: 'remover s3' }));

    expect(screen.getByTestId('groups')).toHaveTextContent(
      'Unhas:s2|Sobrancelhas:s3|Sem duração:s4',
    );
  });

  it('locks the hour again and clears it when the last service is removed', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));
    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));
    await user.selectOptions(screen.getByLabelText('hora'), '10:00');
    await user.click(screen.getByRole('button', { name: 'remover s1' }));

    expect(screen.getByTestId('time-locked')).toHaveTextContent('false');
    expect(screen.getByLabelText('hora')).toHaveValue('10:00');

    await user.click(screen.getByRole('button', { name: 'remover s2' }));

    expect(screen.getByTestId('time-locked')).toHaveTextContent('true');
    expect(screen.getByLabelText('hora')).toHaveValue('');
  });

  it('adds the same service only once', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));
    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(screen.getByTestId('chosen').textContent).toBe('s1');
  });

  it('summarises two or more services, and not one', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(screen.getByTestId('summary')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));

    expect(screen.getByTestId('summary')).toHaveTextContent('2 reservas · 2 h · 45,00 €');
  });

  it('names the submit button after the number of reservations', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    expect(screen.getByTestId('submit-label').textContent).toBe(BOOKING_COPY.submit);

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(screen.getByTestId('submit-label').textContent).toBe(BOOKING_COPY.submit);

    await user.click(screen.getByRole('button', { name: 'adicionar s2' }));

    expect(screen.getByTestId('submit-label').textContent).toBe(BOOKING_COPY.submitMany(2));
  });

  it('clears the “at least one” error on the add that resolves it', async () => {
    const user = userEvent.setup();
    render(<Harness day={SATURDAY} />);

    await user.click(screen.getByRole('button', { name: 'criar' }));

    expect(screen.getByTestId('service-error')).toHaveTextContent('Escolha pelo menos um serviço.');

    await user.click(screen.getByRole('button', { name: 'adicionar s1' }));

    expect(screen.getByTestId('service-error')).toBeEmptyDOMElement();
  });
});

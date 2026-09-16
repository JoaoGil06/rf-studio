import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { BOOKING_COPY } from '../../../utils/constants/scheduleMessages';
import {
  bookingFormDefaults,
  bookingSchema,
  type BookingFormValues,
  type BookingSlot,
  type ClientOption,
  type ServiceOptionGroup,
} from '../types/bookingForm.types';
import { BookingForm } from './bookingForm.view';

const onValid = vi.fn();

const SLOTS: BookingSlot[] = [
  { time: '09:00', label: '09:00', isTaken: false },
  { time: '09:30', label: `09:30 — ${BOOKING_COPY.noTimeSuffix}`, isTaken: true },
  { time: '10:00', label: '10:00', isTaken: false },
  { time: '10:30', label: `10:30 — ${BOOKING_COPY.coveredSuffix}`, isTaken: true },
];

const CLIENTS: ClientOption[] = [
  { id: 'c1', name: 'Ana Marques' },
  { id: 'c2', name: 'Beatriz Sousa' },
];

const SERVICE_GROUPS: ServiceOptionGroup[] = [
  {
    label: 'Unhas',
    options: [{ id: 's1', label: 'Manicure simples · 15,00 €', durationMinutes: 90 }],
  },
  {
    label: 'Sobrancelhas',
    options: [{ id: 's2', label: 'Design · 10,00 €', durationMinutes: 30 }],
  },
];

interface HarnessProps {
  formError?: string | null;
  isSubmitting?: boolean;
  truncatedNote?: string | null;
  slots?: readonly BookingSlot[];
  isTimeLocked?: boolean;
  clients?: readonly ClientOption[];
  serviceGroups?: readonly ServiceOptionGroup[];
}

function Harness({
  formError = null,
  isSubmitting = false,
  truncatedNote = null,
  slots = SLOTS,
  isTimeLocked = false,
  clients = CLIENTS,
  serviceGroups = SERVICE_GROUPS,
}: HarnessProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: 'onSubmit',
    defaultValues: bookingFormDefaults,
  });

  return (
    <BookingForm
      register={register}
      errors={errors}
      onSubmit={handleSubmit(onValid)}
      formError={formError}
      isSubmitting={isSubmitting}
      slots={slots}
      isTimeLocked={isTimeLocked}
      clients={clients}
      serviceGroups={serviceGroups}
      truncatedNote={truncatedNote}
      submitLabel={BOOKING_COPY.submit}
      busyLabel={BOOKING_COPY.busy}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BookingForm — the hour', () => {
  it('offers every studio slot and marks the taken ones unselectable', () => {
    render(<Harness />);

    expect(screen.getByRole('option', { name: '09:00' })).toBeEnabled();
    expect(screen.getByRole('option', { name: '10:00' })).toBeEnabled();

    expect(
      screen.getByRole('option', { name: `09:30 — ${BOOKING_COPY.noTimeSuffix}` }),
    ).toBeDisabled();
    expect(
      screen.getByRole('option', { name: `10:30 — ${BOOKING_COPY.coveredSuffix}` }),
    ).toBeDisabled();
  });

  it('starts on the placeholder rather than guessing an hour', () => {
    render(<Harness />);

    expect(screen.getByLabelText(BOOKING_COPY.timeLabel)).toHaveValue('');
  });

  it('waits on the service: no list, a locked control, and a placeholder that says why', () => {
    render(<Harness isTimeLocked slots={[]} />);

    const time = screen.getByLabelText(BOOKING_COPY.timeLabel);

    expect(time).toBeDisabled();
    expect(screen.getByText(BOOKING_COPY.timeLockedPlaceholder)).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '09:00' })).not.toBeInTheDocument();
  });

  it('asks the service before the hour, so the list is never a guess', () => {
    const { container } = render(<Harness />);

    const labels = Array.from(container.querySelectorAll('label')).map(
      (label) => label.textContent,
    );

    expect(labels).toEqual([
      BOOKING_COPY.serviceLabel,
      BOOKING_COPY.clientLabel,
      BOOKING_COPY.timeLabel,
    ]);
  });
});

describe('BookingForm — the placeholder is not an answer', () => {
  it('offers the placeholder in none of the three lists', () => {
    const { container } = render(<Harness />);

    const placeholders = Array.from(container.querySelectorAll('option')).filter(
      (option) => option.textContent === BOOKING_COPY.choosePlaceholder,
    );

    expect(placeholders).toHaveLength(3);

    for (const placeholder of placeholders) {
      expect(placeholder).toBeDisabled();
      expect(placeholder).toHaveAttribute('hidden');
    }
  });

  it('still shows it as what each select reads while nothing is chosen', () => {
    render(<Harness />);

    for (const field of [
      BOOKING_COPY.timeLabel,
      BOOKING_COPY.clientLabel,
      BOOKING_COPY.serviceLabel,
    ]) {
      expect(screen.getByLabelText(field)).toHaveValue('');
    }
  });
});

describe('BookingForm — the two pickers', () => {
  it('lists the clients it was handed, in the order it was handed them', () => {
    render(<Harness />);

    const options = screen
      .getAllByRole('option')
      .map((option) => option.textContent)
      .filter((text) => text === 'Ana Marques' || text === 'Beatriz Sousa');

    expect(options).toEqual(['Ana Marques', 'Beatriz Sousa']);
  });

  it('groups the services under their category headings', () => {
    const { container } = render(<Harness />);

    const groups = Array.from(container.querySelectorAll('optgroup')).map((group) =>
      group.getAttribute('label'),
    );

    expect(groups).toEqual(['Unhas', 'Sobrancelhas']);
  });

  it('renders the truncation note only when the book did not fit', () => {
    const { rerender } = render(<Harness />);

    expect(screen.queryByText(BOOKING_COPY.clientsTruncated)).not.toBeInTheDocument();

    rerender(<Harness truncatedNote={BOOKING_COPY.clientsTruncated} />);

    expect(screen.getByText(BOOKING_COPY.clientsTruncated)).toBeInTheDocument();
  });
});

describe('BookingForm — submitting', () => {
  it('swaps the submit label for the busy label while submitting', () => {
    const { rerender } = render(<Harness />);

    expect(screen.getByRole('button', { name: BOOKING_COPY.submit })).toBeEnabled();

    rerender(<Harness isSubmitting />);

    expect(screen.getByRole('button', { name: BOOKING_COPY.busy })).toBeDisabled();
  });

  it('reports the chosen booking once all three are answered', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.selectOptions(screen.getByLabelText(BOOKING_COPY.timeLabel), '10:00');
    await user.selectOptions(screen.getByLabelText(BOOKING_COPY.clientLabel), 'c2');
    await user.selectOptions(screen.getByLabelText(BOOKING_COPY.serviceLabel), 's1');
    await user.click(screen.getByRole('button', { name: BOOKING_COPY.submit }));

    expect(onValid).toHaveBeenCalledTimes(1);
    expect(onValid.mock.calls[0]?.[0]).toEqual({
      time: '10:00',
      userId: 'c2',
      serviceId: 's1',
    });
  });

  it('names each field error to its own control', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: BOOKING_COPY.submit }));

    expect(onValid).not.toHaveBeenCalled();

    for (const [label, message] of [
      [BOOKING_COPY.timeLabel, 'Escolha a hora.'],
      [BOOKING_COPY.clientLabel, 'Escolha a cliente.'],
      [BOOKING_COPY.serviceLabel, 'Escolha o serviço.'],
    ] as const) {
      const field = screen.getByLabelText(label);

      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription(message);
    }
  });

  it('announces a form-level failure rather than a raw error', () => {
    render(<Harness formError="Já existe uma reserva nessa hora." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Já existe uma reserva nessa hora.');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BOOKING_COPY } from '../../../utils/constants/scheduleMessages';
import type { BookingDay } from '../../BookingForm/types/bookingForm.types';
import { NewReservationModal } from './newReservationModal.view';

const viewModelMock = vi.fn();
const submitMock = vi.fn();
const resetFormMock = vi.fn();

vi.mock('../viewmodel/newReservationModal.viewmodel', () => ({
  useNewReservationModalViewModel: (day: unknown, serviceGroups: unknown) =>
    viewModelMock(day, serviceGroups),
}));

vi.mock('../../BookingForm', () => ({
  BookingForm: ({
    onSubmit,
    slots,
    truncatedNote,
  }: {
    onSubmit: (event: { preventDefault: () => void }) => void;
    slots: readonly { time: string }[];
    truncatedNote: string | null;
  }) => (
    <form data-testid="booking-form" onSubmit={onSubmit}>
      <span data-testid="slots">{slots.map((slot) => slot.time).join(',')}</span>
      <span data-testid="truncated">{truncatedNote ?? ''}</span>
      <button type="submit">criar</button>
    </form>
  ),
}));

const SATURDAY: BookingDay = {
  key: '2026-09-12',
  label: 'sábado, 12 de Setembro',
  addLabel: 'Nova reserva em sábado, 12 de Setembro',
  busy: [{ startMinutes: 9 * 60 + 30, endMinutes: 10 * 60 }],
};

const SERVICE_GROUPS = [
  { label: 'Unhas', options: [{ id: 's1', label: 'Manicure · 15,00 €', durationMinutes: 30 }] },
];

const onClose = vi.fn();

function renderModal(day: BookingDay | null, truncatedNote: string | null = null) {
  return render(
    <NewReservationModal
      day={day}
      clients={[{ id: 'c1', name: 'Ana' }]}
      serviceGroups={SERVICE_GROUPS}
      truncatedNote={truncatedNote}
      onClose={onClose}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  submitMock.mockResolvedValue(true);
  viewModelMock.mockReturnValue({
    register: vi.fn(),
    handleSubmit:
      (onValid: (values: unknown) => unknown) => (event: { preventDefault: () => void }) => {
        event.preventDefault();
        return onValid({ time: '09:00', userId: 'c1', serviceId: 's1' });
      },
    submit: submitMock,
    resetForm: resetFormMock,
    errors: {},
    formError: null,
    isSaving: false,
    slots: [
      { time: '09:00', isTaken: false },
      { time: '09:30', isTaken: true },
    ],
    isTimeLocked: false,
  });
});

describe('NewReservationModal — when it is there at all', () => {
  it('renders nothing while no day is open', () => {
    renderModal(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument();
  });

  it('names the dialog with the whisper and the day', () => {
    renderModal(SATURDAY);

    expect(
      screen.getByRole('dialog', { name: `${BOOKING_COPY.whisper} ${SATURDAY.label}` }),
    ).toBeInTheDocument();
  });

  it('hands the form the hours the ViewModel worked out, not the day’s raw spans', () => {
    renderModal(SATURDAY);

    expect(screen.getByTestId('slots')).toHaveTextContent('09:00,09:30');
  });

  it('gives the ViewModel the service list, since the hours depend on it', () => {
    renderModal(SATURDAY);

    expect(viewModelMock).toHaveBeenCalledWith(SATURDAY, SERVICE_GROUPS);
  });

  it('passes the truncation note through untouched', () => {
    renderModal(SATURDAY, BOOKING_COPY.clientsTruncated);

    expect(screen.getByTestId('truncated')).toHaveTextContent(BOOKING_COPY.clientsTruncated);
  });
});

describe('NewReservationModal — submitting', () => {
  it('closes and resets once the booking lands', async () => {
    renderModal(SATURDAY);

    await userEvent.setup().click(screen.getByRole('button', { name: 'criar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(resetFormMock).toHaveBeenCalledTimes(1);
  });

  it('stays open, and keeps what was typed, when submit reports failure', async () => {
    submitMock.mockResolvedValue(false);

    renderModal(SATURDAY);

    await userEvent.setup().click(screen.getByRole('button', { name: 'criar' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(resetFormMock).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes and resets on the sheet’s own close control', async () => {
    renderModal(SATURDAY);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(resetFormMock).toHaveBeenCalledTimes(1);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AGENDA_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { AgendaView } from './agenda.view';

const viewModelMock = vi.fn();
const mediaQueryMock = vi.fn();

vi.mock('../viewmodel/agenda.viewmodel', () => ({
  useAgendaViewModel: () => viewModelMock(),
}));

vi.mock('../../../hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => mediaQueryMock(query),
}));

vi.mock('../../../components/CalendarWeekStrip', () => ({
  CalendarWeekStrip: () => <div data-testid="week-strip" />,
}));

vi.mock('../../../components/DayPane', () => ({
  DayPane: ({
    dayLabel,
    addLabel,
    onAddReservation,
  }: {
    dayLabel: string | null;
    addLabel: string | null;
    onAddReservation: () => void;
  }) => (
    <div data-testid="day-pane">
      {dayLabel}
      {addLabel && (
        <button type="button" onClick={onAddReservation}>
          {addLabel}
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../../components/NewReservationModal', () => ({
  NewReservationModal: ({
    day,
    truncatedNote,
    onClose,
  }: {
    day: { key: string; label: string } | null;
    truncatedNote: string | null;
    onClose: () => void;
  }) =>
    day ? (
      <div data-testid="booking-sheet" data-day={day.key}>
        <span data-testid="booking-truncated">{truncatedNote ?? ''}</span>
        <button type="button" onClick={onClose}>
          fechar reserva
        </button>
      </div>
    ) : null,
}));

vi.mock('../../../components/CalendarMonthGrid', () => ({
  CalendarMonthGrid: ({
    days,
    cellAction,
    onSelectDay,
    onAddDay,
  }: {
    days: { key: string }[];
    cellAction: 'select' | 'add';
    onSelectDay: (key: string) => void;
    onAddDay: (key: string) => void;
  }) => (
    <div data-testid="month-grid" data-cell-action={cellAction}>
      {days.map((day) => (
        <button
          key={day.key}
          type="button"
          onClick={() => (cellAction === 'add' ? onAddDay(day.key) : onSelectDay(day.key))}
        >
          {day.key}
        </button>
      ))}
    </div>
  ),
}));

const goToPreviousMonth = vi.fn();
const goToNextMonth = vi.fn();

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    monthLabel: 'Setembro 2026',
    monthDescription: 'agenda de Setembro 2026',
    goToPreviousMonth,
    goToNextMonth,
    selectDay: vi.fn(),
    monthDays: [{ key: '2026-09-12' }],
    weeks: [],
    selectedKey: '2026-09-12',
    dayLabel: 'sábado, 12 de Setembro',
    dayCountLabel: '1 RESERVA',
    isSelectedDayClosed: false,
    daySlots: [],
    clientOptions: [{ id: 'c1', name: 'Ana' }],
    serviceGroups: [{ label: 'Unhas', options: [{ id: 's1', label: 'Manicure · 15,00 €' }] }],
    clientsTruncatedNote: null,
    bookingDays: {
      '2026-09-12': {
        key: '2026-09-12',
        label: 'sábado, 12 de Setembro',
        addLabel: 'Nova reserva em sábado, 12 de Setembro',
        slots: [{ time: '09:00', isTaken: false }],
      },
    },
    selectedBookingDay: {
      key: '2026-09-12',
      label: 'sábado, 12 de Setembro',
      addLabel: 'Nova reserva em sábado, 12 de Setembro',
      slots: [{ time: '09:00', isTaken: false }],
    },
    stats: { reservations: '12', pending: '3', revenue: '1.250,00 €' },
    statuses: [
      { value: 'pending', label: 'Pendente' },
      { value: 'confirmed', label: 'Confirmada' },
      { value: 'completed', label: 'Concluída' },
      { value: 'cancelled', label: 'Cancelada' },
    ],
    hasReservations: true,
    isLoading: false,
    loadError: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  mediaQueryMock.mockReturnValue(false);
});

describe('AgendaView — the header', () => {
  it('names the month once, as the page’s only h1', () => {
    render(<AgendaView />);

    const headings = screen.getAllByRole('heading', { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Setembro 2026');
  });

  it('flanks the month with two arrows named in pt-PT', async () => {
    const user = userEvent.setup();
    render(<AgendaView />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
    await user.click(screen.getByRole('button', { name: 'Mês seguinte' }));

    expect(goToPreviousMonth).toHaveBeenCalledTimes(1);
    expect(goToNextMonth).toHaveBeenCalledTimes(1);
  });

  it('gives each stat a caption a screen reader can hear', () => {
    render(<AgendaView />);

    expect(screen.getByText('RESERVAS')).toBeInTheDocument();
    expect(screen.getByText('PENDENTES')).toBeInTheDocument();
    expect(screen.getByText('FATURADO NO MÊS')).toBeInTheDocument();
    expect(screen.getByText('1.250,00 €')).toBeInTheDocument();
  });

  it('hides the script whisper from assistive tech', () => {
    const { container } = render(<AgendaView />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('agenda de');
  });
});

describe('AgendaView — the legend', () => {
  it('lists the four states of the ledger', () => {
    render(<AgendaView />);

    const legend = screen.getByRole('list', { name: 'Estados de reserva' });

    expect(legend).toHaveTextContent('Pendente');
    expect(legend).toHaveTextContent('Confirmada');
    expect(legend).toHaveTextContent('Concluída');
    expect(legend).toHaveTextContent('Cancelada');
  });
});

describe('AgendaView — the three compositions', () => {
  it('holds the week strip, the month and the day pane in one document', () => {
    render(<AgendaView />);

    expect(screen.getByTestId('week-strip')).toBeInTheDocument();
    expect(screen.getByTestId('month-grid')).toBeInTheDocument();
    expect(screen.getByTestId('day-pane')).toBeInTheDocument();
  });

  it('keeps all three even where the station query matches', () => {
    mediaQueryMock.mockReturnValue(true);

    render(<AgendaView />);

    expect(screen.getByTestId('week-strip')).toBeInTheDocument();
    expect(screen.getByTestId('month-grid')).toBeInTheDocument();
    expect(screen.getByTestId('day-pane')).toBeInTheDocument();
  });

  it('reads the composition through the shared query string, not a literal', () => {
    render(<AgendaView />);

    expect(mediaQueryMock).toHaveBeenCalledWith(
      '(min-width: 621px) and (max-width: 1180px) and (min-height: 541px)',
    );
  });

  it('makes the day cell book where there is no pane to open', () => {
    render(<AgendaView />);

    expect(screen.getByTestId('month-grid')).toHaveAttribute('data-cell-action', 'add');
  });

  it('makes the day cell open the day at the station', () => {
    mediaQueryMock.mockReturnValue(true);

    render(<AgendaView />);

    expect(screen.getByTestId('month-grid')).toHaveAttribute('data-cell-action', 'select');
  });

  it('shows the desk hint and the pane hint, and lets the stylesheet choose', () => {
    render(<AgendaView />);

    expect(screen.getByText(AGENDA_COPY.hintDesk)).toBeInTheDocument();
    expect(screen.getByText(AGENDA_COPY.hintPane)).toBeInTheDocument();
  });
});

describe('AgendaView — the booking sheet', () => {
  it('keeps the sheet shut until a day is asked for', () => {
    render(<AgendaView />);

    expect(screen.queryByTestId('booking-sheet')).not.toBeInTheDocument();
  });

  it('opens the sheet at the cell it was clicked on when there is no pane', async () => {
    const user = userEvent.setup();
    render(<AgendaView />);

    await user.click(screen.getByRole('button', { name: '2026-09-12' }));

    expect(screen.getByTestId('booking-sheet')).toHaveAttribute('data-day', '2026-09-12');
  });

  it('opens the sheet at the day the pane is showing', async () => {
    mediaQueryMock.mockReturnValue(true);

    const user = userEvent.setup();
    render(<AgendaView />);

    await user.click(
      screen.getByRole('button', { name: 'Nova reserva em sábado, 12 de Setembro' }),
    );

    expect(screen.getByTestId('booking-sheet')).toHaveAttribute('data-day', '2026-09-12');
  });

  it('offers the pane nothing to book on a day that cannot be booked', () => {
    viewModelMock.mockReturnValue(aViewModel({ selectedBookingDay: null }));

    render(<AgendaView />);

    expect(
      screen.queryByRole('button', { name: 'Nova reserva em sábado, 12 de Setembro' }),
    ).not.toBeInTheDocument();
  });

  it('closes the sheet without booking', async () => {
    const user = userEvent.setup();
    render(<AgendaView />);

    await user.click(screen.getByRole('button', { name: '2026-09-12' }));
    await user.click(screen.getByRole('button', { name: 'fechar reserva' }));

    expect(screen.queryByTestId('booking-sheet')).not.toBeInTheDocument();
  });

  it('passes the truncation note down to the sheet', async () => {
    viewModelMock.mockReturnValue(aViewModel({ clientsTruncatedNote: 'só as primeiras' }));

    const user = userEvent.setup();
    render(<AgendaView />);

    await user.click(screen.getByRole('button', { name: '2026-09-12' }));

    expect(screen.getByTestId('booking-truncated')).toHaveTextContent('só as primeiras');
  });
});

describe('AgendaView — loading and failure', () => {
  it('announces a load failure rather than rendering a raw error', () => {
    viewModelMock.mockReturnValue(aViewModel({ loadError: SCHEDULE_ERROR_MESSAGES.load }));

    render(<AgendaView />);

    expect(screen.getByRole('alert')).toHaveTextContent(SCHEDULE_ERROR_MESSAGES.load);
  });

  it('shows the loader while the month is in flight', () => {
    viewModelMock.mockReturnValue(aViewModel({ isLoading: true }));

    render(<AgendaView />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('keeps the compositions in the document while loading', () => {
    viewModelMock.mockReturnValue(aViewModel({ isLoading: true }));

    render(<AgendaView />);

    expect(screen.getByTestId('month-grid')).toBeInTheDocument();
  });
});

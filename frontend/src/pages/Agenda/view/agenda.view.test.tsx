import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
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
  DayPane: ({ dayLabel }: { dayLabel: string | null }) => (
    <div data-testid="day-pane">{dayLabel}</div>
  ),
}));

vi.mock('../../../components/CalendarMonthGrid', () => ({
  CalendarMonthGrid: ({
    days,
    isDaySelectable,
    onSelectDay,
  }: {
    days: { key: string }[];
    isDaySelectable: boolean;
    onSelectDay: (key: string) => void;
  }) => (
    <div data-testid="month-grid" data-selectable={String(isDaySelectable)}>
      {isDaySelectable &&
        days.map((day) => (
          <button key={day.key} type="button" onClick={() => onSelectDay(day.key)}>
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

  it('makes no day cell selectable away from the station', () => {
    render(<AgendaView />);

    expect(screen.getByTestId('month-grid')).toHaveAttribute('data-selectable', 'false');
  });

  it('makes day cells selectable at the station', () => {
    mediaQueryMock.mockReturnValue(true);

    render(<AgendaView />);

    expect(screen.getByTestId('month-grid')).toHaveAttribute('data-selectable', 'true');
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

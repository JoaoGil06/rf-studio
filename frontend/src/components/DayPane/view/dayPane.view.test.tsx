import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AGENDA_COPY } from '../../../utils/constants/scheduleMessages';
import type { DaySlot } from '../types/dayPane.types';
import { DayPane } from './dayPane.view';

vi.mock('../../ReservationEntry', () => ({
  ReservationEntry: ({ id, density }: { id: string; density: string }) => (
    <span data-testid="chip" data-id={id} data-density={density} />
  ),
}));

const MORNING: DaySlot[] = [
  { time: '09:00', reservationIds: [], isCovered: false },
  { time: '09:30', reservationIds: ['s1'], isCovered: false },
  { time: '10:00', reservationIds: [], isCovered: false },
];

const onAddReservation = vi.fn();

const ADD_LABEL = 'Nova reserva em sábado, 12 de Setembro';

function renderPane(overrides: Partial<Parameters<typeof DayPane>[0]> = {}) {
  return render(
    <DayPane
      dayLabel={overrides.dayLabel ?? 'sábado, 12 de Setembro'}
      countLabel={overrides.countLabel ?? '1 RESERVA'}
      isClosed={overrides.isClosed ?? false}
      slots={overrides.slots ?? MORNING}
      addLabel={overrides.addLabel === undefined ? ADD_LABEL : overrides.addLabel}
      onAddReservation={overrides.onAddReservation ?? onAddReservation}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DayPane', () => {
  it('heads the pane with the day and what it holds', () => {
    renderPane();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('sábado, 12 de Setembro');
    expect(screen.getByText('1 RESERVA')).toBeInTheDocument();
  });

  it('renders every slot, taken and free', () => {
    renderPane();

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('carries the reading chip, since here the chip is the row', () => {
    renderPane();

    const chips = screen.getAllByTestId('chip');

    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveAttribute('data-density', 'read');
  });

  it('writes “livre” against an hour nothing is booked into', () => {
    renderPane();

    expect(screen.getAllByText('livre')).toHaveLength(2);
  });

  it('offers no control at all on a free slot', () => {
    renderPane({ addLabel: null });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows an empty day as hours rather than as nothing', () => {
    renderPane({
      countLabel: 'SEM RESERVAS',
      slots: [{ time: '09:00', reservationIds: [], isCovered: false }],
    });

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('SEM RESERVAS')).toBeInTheDocument();
  });
});

describe('DayPane — the hours a long appointment runs through', () => {
  it('says the chair is still in use rather than calling the hour free', () => {
    renderPane({
      slots: [
        { time: '10:00', reservationIds: ['s1'], isCovered: false },
        { time: '10:30', reservationIds: [], isCovered: true },
        { time: '11:00', reservationIds: [], isCovered: false },
      ],
    });

    expect(screen.getByText(AGENDA_COPY.coveredSlot)).toBeInTheDocument();
    expect(screen.getAllByText(AGENDA_COPY.freeSlot)).toHaveLength(1);
  });

  it('never covers a row that carries its own reservation', () => {
    renderPane({
      slots: [{ time: '10:00', reservationIds: ['s1'], isCovered: false }],
    });

    expect(screen.queryByText(AGENDA_COPY.coveredSlot)).not.toBeInTheDocument();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
  });
});

describe('DayPane — an hour the studio does not keep', () => {
  it('renders an off-grid slot in its place between the two halves', () => {
    renderPane({
      slots: [
        { time: '11:30', reservationIds: [], isCovered: false },
        { time: '13:00', reservationIds: ['s9'], isCovered: false },
        { time: '14:00', reservationIds: [], isCovered: false },
      ],
    });

    const times = screen.getAllByText(/^\d{2}:\d{2}$/).map((node) => node.textContent);

    expect(times).toEqual(['11:30', '13:00', '14:00']);
  });
});

describe('DayPane — the closed day', () => {
  it('replaces the list with the closed sentence when nothing is booked', () => {
    renderPane({ countLabel: 'FECHADO', isClosed: true, slots: [] });

    expect(screen.getByText('O estúdio está fechado ao domingo.')).toBeInTheDocument();
  });

  it('renders the list, not the hatch, when a closed day carries reservations', () => {
    renderPane({
      countLabel: 'FECHADO',
      isClosed: true,
      slots: [{ time: '10:00', reservationIds: ['s1'], isCovered: false }],
    });

    expect(screen.queryByText('O estúdio está fechado ao domingo.')).not.toBeInTheDocument();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
    expect(screen.getByText('FECHADO')).toBeInTheDocument();
  });
});

describe('DayPane — booking the day it is open at', () => {
  it('offers the booking action for the day it is open at', async () => {
    renderPane();

    await userEvent.setup().click(screen.getByRole('button', { name: ADD_LABEL }));

    expect(onAddReservation).toHaveBeenCalledTimes(1);
  });

  it('names the action by the day, not just “Nova reserva”', () => {
    renderPane();

    const action = screen.getByRole('button', { name: ADD_LABEL });

    expect(action).toHaveTextContent('Nova reserva');
    expect(action).toHaveAccessibleName(ADD_LABEL);
  });

  it('offers nothing to book on a closed day', () => {
    renderPane({ countLabel: 'FECHADO', isClosed: true, slots: [], addLabel: null });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps the closed hatch free of controls', () => {
    renderPane({ countLabel: 'FECHADO', isClosed: true, slots: [], addLabel: null });

    expect(screen.getByText('O estúdio está fechado ao domingo.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

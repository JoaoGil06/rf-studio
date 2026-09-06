import { render, screen } from '@testing-library/react';
import type { DaySlot } from '../types/dayPane.types';
import { DayPane } from './dayPane.view';

vi.mock('../../ReservationEntry', () => ({
  ReservationEntry: ({ id, density }: { id: string; density: string }) => (
    <span data-testid="chip" data-id={id} data-density={density} />
  ),
}));

const MORNING: DaySlot[] = [
  { time: '09:00', reservationIds: [] },
  { time: '09:30', reservationIds: ['s1'] },
  { time: '10:00', reservationIds: [] },
];

function renderPane(overrides: Partial<Parameters<typeof DayPane>[0]> = {}) {
  return render(
    <DayPane
      dayLabel={overrides.dayLabel ?? 'sábado, 12 de Setembro'}
      countLabel={overrides.countLabel ?? '1 RESERVA'}
      isClosed={overrides.isClosed ?? false}
      slots={overrides.slots ?? MORNING}
    />,
  );
}

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
    renderPane();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows an empty day as hours rather than as nothing', () => {
    renderPane({ countLabel: 'SEM RESERVAS', slots: [{ time: '09:00', reservationIds: [] }] });

    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('SEM RESERVAS')).toBeInTheDocument();
  });
});

describe('DayPane — an hour the studio does not keep', () => {
  it('renders an off-grid slot in its place between the two halves', () => {
    renderPane({
      slots: [
        { time: '11:30', reservationIds: [] },
        { time: '13:00', reservationIds: ['s9'] },
        { time: '14:00', reservationIds: [] },
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
      slots: [{ time: '10:00', reservationIds: ['s1'] }],
    });

    expect(screen.queryByText('O estúdio está fechado ao domingo.')).not.toBeInTheDocument();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
    expect(screen.getByText('FECHADO')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MonthGridDay } from '../types/calendarMonthGrid.types';
import { CalendarMonthGrid } from './calendarMonthGrid.view';

vi.mock('../../ReservationEntry', () => ({
  ReservationEntry: ({ id, density }: { id: string; density: string }) => (
    <span data-testid="chip" data-id={id} data-density={density} />
  ),
}));

function aDay(overrides: Partial<MonthGridDay> = {}): MonthGridDay {
  return {
    key: '2026-09-12',
    dayOfMonth: 12,
    isOutsideMonth: false,
    isClosed: false,
    isToday: false,
    isSelected: false,
    count: null,
    reservationIds: [],
    overflow: 0,
    description: '12 de Setembro, sem reservas',
    ...overrides,
  };
}

const onSelectDay = vi.fn();

function renderGrid(days: MonthGridDay[], isDaySelectable = false) {
  return render(
    <CalendarMonthGrid days={days} isDaySelectable={isDaySelectable} onSelectDay={onSelectDay} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CalendarMonthGrid', () => {
  it('heads the grid with seven Monday-first columns', () => {
    renderGrid([aDay()]);

    expect(screen.getByText('SEG')).toBeInTheDocument();
    expect(screen.getByText('DOM')).toBeInTheDocument();
  });

  it('renders one cell per day it was handed', () => {
    renderGrid([aDay({ key: 'a', dayOfMonth: 1 }), aDay({ key: 'b', dayOfMonth: 2 })]);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows a count only where there is one to show', () => {
    renderGrid([aDay({ key: 'a', dayOfMonth: 1, count: 3 }), aDay({ key: 'b', dayOfMonth: 2 })]);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('carries the dense chip, since a cell is a mark and not a row', () => {
    renderGrid([aDay({ reservationIds: ['s1', 's2'] })]);

    const chips = screen.getAllByTestId('chip');

    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveAttribute('data-density', 'dense');
  });

  it('summarises what will not fit', () => {
    renderGrid([aDay({ reservationIds: ['s1', 's2', 's3'], overflow: 2 })]);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('says FECHADO on a closed day', () => {
    renderGrid([aDay({ isClosed: true })]);

    expect(screen.getByText('FECHADO')).toBeInTheDocument();
  });
});

describe('CalendarMonthGrid — days outside the month', () => {
  it('renders no chip even when ids are passed', () => {
    renderGrid([aDay({ isOutsideMonth: true, reservationIds: ['s1'] })]);

    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });

  it('renders no overflow summary either', () => {
    renderGrid([aDay({ isOutsideMonth: true, reservationIds: ['s1'], overflow: 4 })]);

    expect(screen.queryByText('+4')).not.toBeInTheDocument();
  });

  it('is never a control, even where cells select', () => {
    renderGrid([aDay({ isOutsideMonth: true })], true);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders no list wrapper where there is nothing to list', () => {
    renderGrid([aDay({ isOutsideMonth: true, reservationIds: ['s1'] })]);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('CalendarMonthGrid — the cell changes job with the composition', () => {
  it('renders no buttons where days are not selectable', () => {
    renderGrid([aDay(), aDay({ key: '2026-09-13', dayOfMonth: 13 })], false);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a named button per day where they are', () => {
    renderGrid([aDay()], true);

    expect(
      screen.getByRole('button', { name: '12 de Setembro, sem reservas' }),
    ).toBeInTheDocument();
  });

  it('reports the day key it was given, and nothing derived', async () => {
    renderGrid([aDay()], true);

    await userEvent.setup().click(screen.getByRole('button'));

    expect(onSelectDay).toHaveBeenCalledWith('2026-09-12');
  });

  it('marks the selected cell as pressed', () => {
    renderGrid([aDay({ isSelected: true })], true);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});

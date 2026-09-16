import { render, screen } from '@testing-library/react';
import type { ReservationRowViewModel } from '../types/reservationRow.types';
import { ReservationRow } from './reservationRow.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/reservationRow.viewmodel', () => ({
  useReservationRowViewModel: () => viewModelMock(),
}));

function aRow(overrides: Partial<ReservationRowViewModel> = {}): ReservationRowViewModel {
  return {
    statusValue: 'pending',
    statusLabel: 'Pendente',
    title: 'Maria Silva · Unhas',
    serviceName: 'Gel',
    when: '12 Setembro · 10:00',
    description: 'Pendente — Maria Silva · Unhas, Gel, sábado, 12 de Setembro de 2026 às 10:00',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aRow());
});

describe('ReservationRow', () => {
  it('renders nothing while the reservation is not in the cache', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = render(<ReservationRow id="schedule-1" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the badge, the title, the service and when', () => {
    render(<ReservationRow id="schedule-1" />);

    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Maria Silva · Unhas')).toBeInTheDocument();
    expect(screen.getByText('Gel')).toBeInTheDocument();
    expect(screen.getByText('12 Setembro · 10:00')).toBeInTheDocument();
  });

  it('carries the state on the badge as data, for the stylesheet to read', () => {
    viewModelMock.mockReturnValue(aRow({ statusValue: 'completed', statusLabel: 'Concluída' }));

    render(<ReservationRow id="schedule-1" />);

    expect(screen.getByText('Concluída')).toHaveAttribute('data-status', 'completed');
  });

  it('names the whole row for assistive tech', () => {
    render(<ReservationRow id="schedule-1" />);

    expect(screen.getByRole('article', { name: aRow().description })).toBeInTheDocument();
  });

  it('is not pressable — there is nothing for it to open yet', () => {
    render(<ReservationRow id="schedule-1" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

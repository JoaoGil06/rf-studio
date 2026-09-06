import { render, screen } from '@testing-library/react';
import type { ReservationEntryViewModel } from '../types/reservationEntry.types';
import { ReservationEntry } from './reservationEntry.view';

const viewModelMock = vi.fn();

vi.mock('../viewmodel/reservationEntry.viewmodel', () => ({
  useReservationEntryViewModel: (id: string, density: string) => viewModelMock(id, density),
}));

const confirmed: ReservationEntryViewModel = {
  label: '10:00 Unhas · Ana',
  description: 'Reserva de sábado, 12 de Setembro de 2026 às 10:00 — Confirmada, Ana Sofia Martins',
  statusValue: 'confirmed',
};

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(confirmed);
});

describe('ReservationEntry', () => {
  it('renders the label and names itself in full for assistive tech', () => {
    render(<ReservationEntry id="schedule-1" density="dense" />);

    const entry = screen.getByRole('listitem');

    expect(entry).toHaveTextContent('10:00 Unhas · Ana');
    expect(entry).toHaveAccessibleName(confirmed.description);
  });

  it('writes its state where the stylesheet can select on it', () => {
    render(<ReservationEntry id="schedule-1" density="dense" />);

    expect(screen.getByRole('listitem')).toHaveAttribute('data-status', 'confirmed');
  });

  it('passes the density through to the viewmodel rather than deciding the label itself', () => {
    render(<ReservationEntry id="schedule-1" density="read" />);

    expect(viewModelMock).toHaveBeenCalledWith('schedule-1', 'read');
  });

  it('takes a different class per density, since density is layout', () => {
    const { container: dense } = render(<ReservationEntry id="schedule-1" density="dense" />);
    const { container: read } = render(<ReservationEntry id="schedule-2" density="read" />);

    expect(dense.querySelector('span')?.className).not.toBe(read.querySelector('span')?.className);
  });

  it('is not a control', () => {
    render(<ReservationEntry id="schedule-1" density="read" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing while the fragment has not landed', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = render(<ReservationEntry id="schedule-1" density="dense" />);

    expect(container).toBeEmptyDOMElement();
  });
});

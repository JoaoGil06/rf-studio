import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReservationRowViewModel } from '../types/reservationRow.types';
import { ReservationRow } from './reservationRow.view';

const viewModelMock = vi.fn();
const onAction = vi.fn();

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
    actions: [],
    ...overrides,
  };
}

const PENDING_ACTIONS: ReservationRowViewModel['actions'] = [
  {
    kind: 'confirm',
    label: 'CONFIRMAR',
    accessibleLabel: 'Confirmar reserva de Maria Silva, sábado, 12 de Setembro de 2026 às 10:00',
    isDanger: false,
  },
  {
    kind: 'cancel',
    label: 'CANCELAR',
    accessibleLabel: 'Cancelar reserva de Maria Silva, sábado, 12 de Setembro de 2026 às 10:00',
    isDanger: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aRow());
});

describe('ReservationRow', () => {
  it('renders nothing while the reservation is not in the cache', () => {
    viewModelMock.mockReturnValue(null);

    const { container } = render(<ReservationRow id="schedule-1" onAction={onAction} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the badge, the title, the service and when', () => {
    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Maria Silva · Unhas')).toBeInTheDocument();
    expect(screen.getByText('Gel')).toBeInTheDocument();
    expect(screen.getByText('12 Setembro · 10:00')).toBeInTheDocument();
  });

  it('carries the state on the badge as data, for the stylesheet to read', () => {
    viewModelMock.mockReturnValue(aRow({ statusValue: 'completed', statusLabel: 'Concluída' }));

    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    expect(screen.getByText('Concluída')).toHaveAttribute('data-status', 'completed');
  });

  it('names the whole row for assistive tech', () => {
    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    expect(screen.getByRole('article', { name: aRow().description })).toBeInTheDocument();
  });

  it('offers no buttons when the reservation has no actions — Concluídas and Canceladas', () => {
    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders one pill per action, named for assistive tech', () => {
    viewModelMock.mockReturnValue(aRow({ actions: PENDING_ACTIONS }));

    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    const confirm = screen.getByRole('button', { name: PENDING_ACTIONS[0]?.accessibleLabel });
    const cancel = screen.getByRole('button', { name: PENDING_ACTIONS[1]?.accessibleLabel });

    expect(confirm).toHaveTextContent('CONFIRMAR');
    expect(cancel).toHaveTextContent('CANCELAR');
    expect(confirm.compareDocumentPosition(cancel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('reports which action was pressed on which reservation', async () => {
    viewModelMock.mockReturnValue(aRow({ actions: PENDING_ACTIONS }));

    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: PENDING_ACTIONS[1]?.accessibleLabel }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('schedule-1', 'cancel');
  });

  it('carries the kind and tone as data, for the stylesheet to read', () => {
    viewModelMock.mockReturnValue(aRow({ actions: PENDING_ACTIONS }));

    render(<ReservationRow id="schedule-1" onAction={onAction} />);

    const cancel = screen.getByRole('button', { name: PENDING_ACTIONS[1]?.accessibleLabel });
    expect(cancel).toHaveAttribute('data-kind', 'cancel');
    expect(cancel).toHaveAttribute('data-danger', 'true');
  });
});

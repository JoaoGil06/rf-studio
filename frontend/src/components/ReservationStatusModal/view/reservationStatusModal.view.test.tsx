import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RESERVATION_ACTIONS } from '../../../utils/constants/reservationActions';
import { ReservationStatusModal } from './reservationStatusModal.view';

const confirmMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/reservationStatusModal.viewmodel', () => ({
  useReservationStatusModalViewModel: () => viewModelMock(),
}));

const onClose = vi.fn();
const CANCEL = RESERVATION_ACTIONS.cancel;

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    subject: 'Maria Silva, 12 Setembro às 10:00',
    title: CANCEL.title,
    verb: CANCEL.verb,
    consequence: CANCEL.consequence,
    keepLabel: CANCEL.keepLabel,
    actLabel: CANCEL.actLabel,
    tone: CANCEL.tone,
    isUpdating: false,
    confirm: confirmMock,
    ...overrides,
  };
}

function renderModal() {
  return render(<ReservationStatusModal scheduleId="s1" kind="cancel" onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  confirmMock.mockResolvedValue(null);
});

describe('ReservationStatusModal', () => {
  it('renders nothing while there is nothing to ask about', () => {
    viewModelMock.mockReturnValue(aViewModel({ subject: null }));

    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks about the reservation by client, day and hour, and says what follows', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Cancelar reserva' });
    expect(dialog).toHaveTextContent('Cancelar a reserva de Maria Silva, 12 Setembro às 10:00?');
    expect(dialog).toHaveTextContent(CANCEL.consequence);
    expect(screen.getByRole('button', { name: 'MANTER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SIM, CANCELAR' })).toBeInTheDocument();
  });

  it('closes without changing anything when MANTER is pressed', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'MANTER' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('changes the state and then closes', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'SIM, CANCELAR' }));

    expect(confirmMock).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open with the mapped copy when the change failed', async () => {
    confirmMock.mockResolvedValue('Esta reserva já não existe.');
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'SIM, CANCELAR' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Esta reserva já não existe.');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables both buttons while the change is in flight', () => {
    viewModelMock.mockReturnValue(aViewModel({ isUpdating: true }));

    renderModal();

    expect(screen.getByRole('button', { name: 'MANTER' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'SIM, CANCELAR' })).toBeDisabled();
  });
});

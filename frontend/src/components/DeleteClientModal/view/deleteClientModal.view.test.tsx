import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteClientModal } from './deleteClientModal.view';

const confirmMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/deleteClientModal.viewmodel', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../viewmodel/deleteClientModal.viewmodel')>()),
  useDeleteClientModalViewModel: () => viewModelMock(),
}));

const onClose = vi.fn();

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Maria Silva',
    confirm: confirmMock,
    isDeleting: false,
    title: 'Remover cliente',
    keepLabel: 'MANTER',
    removeLabel: 'REMOVER',
    ...overrides,
  };
}

function renderModal(clientId: string | null = 'c1') {
  return render(<DeleteClientModal clientId={clientId} onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  confirmMock.mockResolvedValue(null);
});

describe('DeleteClientModal', () => {
  it('renders nothing while it is closed', () => {
    const { container } = renderModal(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the id points at a client the cache no longer holds', () => {
    viewModelMock.mockReturnValue(aViewModel({ name: null }));

    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
  });

  it('asks about the client by name, so the wrong row cannot be removed blind', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Remover cliente' })).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });

  it('offers both pills, with keeping the client first', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'MANTER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeInTheDocument();
  });

  it('closes once the viewmodel reports the client was removed', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(confirmMock).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open and shows the failure the viewmodel mapped', async () => {
    confirmMock.mockResolvedValue(
      'Não foi possível remover a cliente. Pode ter reservas associadas.',
    );
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível remover a cliente. Pode ter reservas associadas.',
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes without removing anything when MANTER is pressed', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'MANTER' }));

    expect(confirmMock).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks out both pills while the removal is in flight', () => {
    viewModelMock.mockReturnValue(aViewModel({ isDeleting: true }));

    renderModal();

    expect(screen.getByRole('button', { name: 'MANTER' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeDisabled();
  });
});

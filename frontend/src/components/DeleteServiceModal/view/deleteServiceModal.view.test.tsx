import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteServiceModal } from './deleteServiceModal.view';

const confirmMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/deleteServiceModal.viewmodel', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../viewmodel/deleteServiceModal.viewmodel')>()),
  useDeleteServiceModalViewModel: () => viewModelMock(),
}));

const onClose = vi.fn();

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Manicure simples',
    confirm: confirmMock,
    isDeleting: false,
    title: 'Remover serviço',
    keepLabel: 'MANTER',
    removeLabel: 'REMOVER',
    ...overrides,
  };
}

function renderModal(serviceId: string | null = 's1') {
  return render(<DeleteServiceModal serviceId={serviceId} onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  confirmMock.mockResolvedValue(null);
});

describe('DeleteServiceModal', () => {
  it('renders nothing while it is closed', () => {
    const { container } = renderModal(null);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when the id points at a service the cache no longer holds', () => {
    viewModelMock.mockReturnValue(aViewModel({ name: null }));

    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
  });

  it('hands the service’s name and the viewmodel’s copy to the dialog', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Remover serviço' });
    expect(dialog).toHaveTextContent('Remover Manicure simples?');
    expect(screen.getByRole('button', { name: 'MANTER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeInTheDocument();
  });

  it('wires the viewmodel’s confirm to the destructive pill', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(confirmMock).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('passes the in-flight flag through, so the pills disable while deleting', () => {
    viewModelMock.mockReturnValue(aViewModel({ isDeleting: true }));

    renderModal();

    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeDisabled();
  });
});

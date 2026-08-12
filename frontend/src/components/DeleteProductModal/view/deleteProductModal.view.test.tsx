import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteProductModal } from './deleteProductModal.view';

const confirmMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/deleteProductModal.viewmodel', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../viewmodel/deleteProductModal.viewmodel')>()),
  useDeleteProductModalViewModel: () => viewModelMock(),
}));

const onClose = vi.fn();

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Nude Rosé',
    confirm: confirmMock,
    isDeleting: false,
    title: 'Remover produto',
    keepLabel: 'MANTER',
    removeLabel: 'REMOVER',
    ...overrides,
  };
}

function renderModal(productId: string | null = 'p1') {
  return render(<DeleteProductModal productId={productId} onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  confirmMock.mockResolvedValue(null);
});

describe('DeleteProductModal', () => {
  it('renders nothing while it is closed', () => {
    const { container } = renderModal(null);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when the id points at a product the cache no longer holds', () => {
    viewModelMock.mockReturnValue(aViewModel({ name: null }));

    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
  });

  it('names the product inside the question', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Remover produto' });
    expect(dialog).toHaveTextContent('Remover Nude Rosé?');
  });

  it('offers both pills', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'MANTER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeInTheDocument();
  });

  it('never opens with focus on the destructive pill', () => {
    renderModal();

    const remove = screen.getByRole('button', { name: 'REMOVER' });
    expect(remove).not.toHaveFocus();
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('puts MANTER ahead of REMOVER in the body', () => {
    renderModal();

    const keep = screen.getByRole('button', { name: 'MANTER' });
    const remove = screen.getByRole('button', { name: 'REMOVER' });

    expect(keep.compareDocumentPosition(remove)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('closes without deleting when MANTER is pressed', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'MANTER' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('deletes and then closes when REMOVER is pressed', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(confirmMock).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open with the copy the viewmodel mapped when the delete failed', async () => {
    confirmMock.mockResolvedValue('Este produto já não existe.');
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'REMOVER' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este produto já não existe.');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disables both pills while the delete is in flight', () => {
    viewModelMock.mockReturnValue(aViewModel({ isDeleting: true }));

    renderModal();

    expect(screen.getByRole('button', { name: 'REMOVER' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'MANTER' })).toBeDisabled();
  });
});

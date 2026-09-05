import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { ClientsView } from './clients.view';

const viewModelMock = vi.fn();
const submitMock = vi.fn();
const resetFormMock = vi.fn();

vi.mock('../viewmodel/clients.viewmodel', () => ({
  useClientsViewModel: () => viewModelMock(),
}));
vi.mock('../../../components/ClientRow', () => ({
  ClientRow: ({
    id,
    onEdit,
    onDelete,
  }: {
    id: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid="client-row">
      <span data-testid="client-row-id">{id}</span>
      <button type="button" onClick={() => onEdit(id)}>{`editar ${id}`}</button>
      <button type="button" onClick={() => onDelete(id)}>{`remover ${id}`}</button>
    </div>
  ),
}));

vi.mock('../../../components/EditClientModal', () => ({
  EditClientModal: ({ clientId, onClose }: { clientId: string | null; onClose: () => void }) =>
    clientId ? (
      <div data-testid="edit-modal">
        {clientId}
        <button type="button" onClick={onClose}>
          fechar edicao
        </button>
      </div>
    ) : null,
}));

vi.mock('../../../components/DeleteClientModal', () => ({
  DeleteClientModal: ({ clientId, onClose }: { clientId: string | null; onClose: () => void }) =>
    clientId ? (
      <div data-testid="delete-modal">
        {clientId}
        <button type="button" onClick={onClose}>
          fechar remocao
        </button>
      </div>
    ) : null,
}));

const EMPTY_TITLE = 'Ainda sem clientes';

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    clientIds: ['c1', 'c3'],
    sentinelRef: vi.fn(),
    isLoading: false,
    isLoadingMore: false,
    loadError: null,
    resetForm: resetFormMock,
    register: () => ({ name: 'name', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }),
    handleSubmit:
      (onValid: (values: unknown) => Promise<void>) =>
      async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        await onValid({
          name: 'Maria Silva',
          email: 'maria@exemplo.pt',
          phoneNumber: '912345678',
        });
      },
    submit: submitMock,
    errors: {},
    formError: null,
    isSubmitting: false,
    ...overrides,
  };
}

function renderPage(overrides: Record<string, unknown> = {}) {
  viewModelMock.mockReturnValue(aViewModel(overrides));

  return render(<ClientsView />);
}

beforeEach(() => {
  vi.clearAllMocks();
  submitMock.mockResolvedValue(true);
});

describe('ClientsView — the book', () => {
  it('renders the page heading', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeInTheDocument();
  });

  it('renders one row per id, in the order the viewmodel gave them', () => {
    renderPage();

    expect(screen.getAllByTestId('client-row-id').map((row) => row.textContent)).toEqual([
      'c1',
      'c3',
    ]);
  });

  it('shows the empty panel once the request has settled on nothing', () => {
    renderPage({ clientIds: [] });

    expect(screen.getByText(EMPTY_TITLE)).toBeInTheDocument();
  });

  it('does not call the book empty while its first page is still coming', () => {
    renderPage({ clientIds: [], isLoading: true });

    expect(screen.queryByText(EMPTY_TITLE)).not.toBeInTheDocument();
  });

  it('announces a failed load and does not also claim the book is empty', () => {
    renderPage({ clientIds: [], loadError: CLIENT_ERROR_MESSAGES.load });

    expect(screen.getByRole('alert')).toHaveTextContent(CLIENT_ERROR_MESSAGES.load);
    expect(screen.queryByText(EMPTY_TITLE)).not.toBeInTheDocument();
  });

  it('shows the loader only while a further page is coming', () => {
    const { unmount } = renderPage();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    unmount();
    renderPage({ isLoadingMore: true });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('ClientsView — the inline add bar', () => {
  it('keeps the bar on the page with no tile to press and no dialog to open', () => {
    renderPage();

    expect(screen.getByLabelText('Nome da cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Telemóvel')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the bar reachable even while the book is empty', () => {
    renderPage({ clientIds: [] });

    expect(screen.getByLabelText('Nome da cliente')).toBeInTheDocument();
    expect(screen.getByText(EMPTY_TITLE)).toBeInTheDocument();
  });

  it('empties the bar once the client has landed', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(submitMock).toHaveBeenCalled();
    expect(resetFormMock).toHaveBeenCalled();
  });

  it('leaves the typed values in the bar when the client was rejected', async () => {
    submitMock.mockResolvedValue(false);
    renderPage({ formError: CLIENT_ERROR_MESSAGES.alreadyExists });

    await userEvent.setup().click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(resetFormMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(CLIENT_ERROR_MESSAGES.alreadyExists);
  });
});

describe('ClientsView — opening and closing the two sheets', () => {
  it('mounts neither modal at rest', () => {
    renderPage();

    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('opens the edit sheet on the row that asked for it', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'editar c3' }));

    expect(screen.getByTestId('edit-modal')).toHaveTextContent('c3');
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('opens the confirmation on the row that asked for it', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover c1' }));

    expect(screen.getByTestId('delete-modal')).toHaveTextContent('c1');
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('takes the id back when the edit sheet closes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'editar c1' }));
    await user.click(screen.getByRole('button', { name: 'fechar edicao' }));

    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('takes the id back when the confirmation closes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'remover c1' }));
    await user.click(screen.getByRole('button', { name: 'fechar remocao' }));

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('mounts a single edit sheet however many rows there are', async () => {
    renderPage({ clientIds: ['c1', 'c2', 'c3', 'c4'] });

    await userEvent.setup().click(screen.getByRole('button', { name: 'editar c2' }));

    expect(screen.getAllByTestId('edit-modal')).toHaveLength(1);
  });
});

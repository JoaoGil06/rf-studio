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
  ClientRow: ({ id }: { id: string }) => <div data-testid="client-row">{id}</div>,
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

    expect(screen.getAllByTestId('client-row').map((row) => row.textContent)).toEqual(['c1', 'c3']);
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
  /**
   * The whole point of the divergence from Produtos and Serviços: Rita adds a
   * client while that client is standing in front of her, so the bar is never
   * behind a tile and a modal.
   */
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

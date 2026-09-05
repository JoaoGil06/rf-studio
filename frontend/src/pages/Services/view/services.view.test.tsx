import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { SERVICE_CATEGORIES } from '../../../utils/constants/serviceCategories';
import { ServicesView } from './services.view';

const viewModelMock = vi.fn();
const submitMock = vi.fn();
const resetFormMock = vi.fn();
const selectCategoryMock = vi.fn();

vi.mock('../viewmodel/services.viewmodel', () => ({
  useServicesViewModel: () => viewModelMock(),
}));
vi.mock('../../../components/ServiceCard', () => ({
  ServiceCard: ({
    id,
    onEdit,
    onDelete,
  }: {
    id: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid="service-card" data-id={id}>
      <button type="button" onClick={() => onEdit(id)}>{`editar ${id}`}</button>
      <button type="button" onClick={() => onDelete(id)}>{`remover ${id}`}</button>
    </div>
  ),
}));

vi.mock('../../../components/EditServiceModal', () => ({
  EditServiceModal: ({ serviceId, onClose }: { serviceId: string | null; onClose: () => void }) =>
    serviceId ? (
      <div data-testid="edit-modal">
        {serviceId}
        <button type="button" onClick={onClose}>
          fechar edicao
        </button>
      </div>
    ) : null,
}));
vi.mock('../../../components/DeleteServiceModal', () => ({
  DeleteServiceModal: ({
    serviceId,
    onClose,
  }: {
    serviceId: string | null;
    onClose: () => void;
  }) =>
    serviceId ? (
      <div data-testid="delete-modal">
        {serviceId}
        <button type="button" onClick={onClose}>
          fechar remocao
        </button>
      </div>
    ) : null,
}));

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    categories: SERVICE_CATEGORIES,
    category: SERVICE_CATEGORIES[0],
    selectCategory: selectCategoryMock,
    serviceIds: ['s1', 's3'],
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
        await onValid({ name: 'Manicure simples', price: 15, durationMinutes: 45 });
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

  return render(
    <MemoryRouter initialEntries={[PATHS.services]}>
      <ServicesView />
    </MemoryRouter>,
  );
}

async function openSheet() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'ADICIONAR SERVIÇO' }));
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
  submitMock.mockResolvedValue(true);
});

describe('ServicesView', () => {
  it('renders the page heading and both tabs', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Serviços' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UNHAS' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'SOBRANCELHAS' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('renders one card per id, in the order the viewmodel gave them', () => {
    renderPage();

    expect(
      screen.getAllByTestId('service-card').map((card) => card.getAttribute('data-id')),
    ).toEqual(['s1', 's3']);
  });

  it('hands a picked tab back to the viewmodel', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'SOBRANCELHAS' }));

    expect(selectCategoryMock).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'sobrancelhas' }),
    );
  });

  it('keeps the sheet out of the page until the tile is pressed', () => {
    renderPage();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the sheet from the add tile, titled for a new service', async () => {
    renderPage();
    await openSheet();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo serviço' })).toBeInTheDocument();
  });

  it('empties the form on the way into the sheet', async () => {
    renderPage();
    await openSheet();

    expect(resetFormMock).toHaveBeenCalled();
  });

  it('empties the form on the way out of the sheet', async () => {
    renderPage();
    const user = await openSheet();
    resetFormMock.mockClear();

    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(resetFormMock).toHaveBeenCalled();
  });

  it('closes the sheet once the service has landed', async () => {
    renderPage();
    const user = await openSheet();

    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(submitMock).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves the sheet open, with the error showing, when the service was rejected', async () => {
    submitMock.mockResolvedValue(false);
    renderPage({ formError: SERVICE_ERROR_MESSAGES.alreadyExists });
    const user = await openSheet();

    await user.click(screen.getByRole('button', { name: 'ADICIONAR' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(SERVICE_ERROR_MESSAGES.alreadyExists);
  });

  it('announces a failed load and does not also claim the catalogue is empty', () => {
    renderPage({ serviceIds: [], loadError: SERVICE_ERROR_MESSAGES.load });

    expect(screen.getByRole('alert')).toHaveTextContent(SERVICE_ERROR_MESSAGES.load);
    expect(screen.queryByText('Ainda sem serviços.')).not.toBeInTheDocument();
  });

  it('shows the empty panel once the request has settled on nothing', () => {
    renderPage({ serviceIds: [] });

    expect(screen.getByText('Ainda sem serviços.')).toBeInTheDocument();
  });

  it('does not call a catalogue empty while its first page is still coming', () => {
    renderPage({ serviceIds: [], isLoading: true });

    expect(screen.queryByText('Ainda sem serviços.')).not.toBeInTheDocument();
  });

  it('shows the loader only while a further page is coming', () => {
    const { unmount } = renderPage();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    unmount();
    renderPage({ isLoadingMore: true });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('keeps the footer note on the page whatever else is showing', () => {
    renderPage({ serviceIds: [] });

    expect(
      screen.getByText('Os serviços ficam disponíveis para associar às reservas ao concluir.'),
    ).toBeInTheDocument();
  });
});

describe('ServicesView — opening the edit and delete modals', () => {
  it('keeps both modals shut until a card asks for one', () => {
    renderPage();

    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('opens the edit modal on the card that reported, not the first one', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'editar s3' }));

    expect(screen.getByTestId('edit-modal')).toHaveTextContent('s3');
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('opens the delete modal on the card that reported, not the first one', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover s3' }));

    expect(screen.getByTestId('delete-modal')).toHaveTextContent('s3');
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('clears the id when the edit modal closes, so reopening is a fresh read', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'editar s1' }));
    await user.click(screen.getByRole('button', { name: 'fechar edicao' }));

    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  });

  it('clears the id when the delete modal closes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'remover s1' }));
    await user.click(screen.getByRole('button', { name: 'fechar remocao' }));

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('mounts one edit modal for the whole grid, not one per card', async () => {
    renderPage({ serviceIds: ['s1', 's3', 's5'] });

    await userEvent.setup().click(screen.getByRole('button', { name: 'editar s5' }));

    expect(screen.getAllByTestId('edit-modal')).toHaveLength(1);
  });

  it('leaves the add sheet alone while a card modal is open', async () => {
    renderPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'editar s1' }));

    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ADICIONAR' })).not.toBeInTheDocument();
  });
});

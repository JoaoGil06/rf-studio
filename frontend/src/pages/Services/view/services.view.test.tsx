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
  ServiceCard: ({ id }: { id: string }) => <div data-testid="service-card">{id}</div>,
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

    expect(screen.getAllByTestId('service-card').map((card) => card.textContent)).toEqual([
      's1',
      's3',
    ]);
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

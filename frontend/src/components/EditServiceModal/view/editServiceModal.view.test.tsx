import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditServiceModal } from './editServiceModal.view';

const submitMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/editServiceModal.viewmodel', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../viewmodel/editServiceModal.viewmodel')>()),
  useEditServiceModalViewModel: () => viewModelMock(),
}));

const onClose = vi.fn();

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    service: { id: 's1', name: 'Manicure simples', price: 15, durationMinutes: 45 },
    title: 'Editar serviço',
    submitLabel: 'GUARDAR',
    busyLabel: 'A GUARDAR…',
    register: () => ({ name: 'field' }),
    handleSubmit:
      (onValid: (values: unknown) => unknown) => (event: { preventDefault: () => void }) => {
        event.preventDefault();
        return onValid({ name: 'Manicure simples', price: 15, durationMinutes: 45 });
      },
    submit: submitMock,
    errors: {},
    formError: null,
    isSubmitting: false,
    ...overrides,
  };
}

function renderModal(serviceId: string | null = 's1') {
  return render(<EditServiceModal serviceId={serviceId} onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  submitMock.mockResolvedValue(true);
});

describe('EditServiceModal', () => {
  it('renders nothing while it is closed', () => {
    const { container } = renderModal(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the id points at a service the cache no longer holds', () => {
    viewModelMock.mockReturnValue(aViewModel({ service: null }));

    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
  });

  it('opens on the viewmodel’s title with the form’s edit labels', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Editar serviço' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GUARDAR' })).toBeInTheDocument();
  });

  it('offers the three editable fields', () => {
    renderModal();

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço (€)')).toBeInTheDocument();
    expect(screen.getByLabelText('Duração (minutos)')).toBeInTheDocument();
  });

  it('offers no way to change the category', () => {
    renderModal();

    expect(screen.queryByLabelText(/categoria/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('closes once the viewmodel reports the service landed', async () => {
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'GUARDAR' }));

    expect(submitMock).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open when the viewmodel reports the save failed', async () => {
    submitMock.mockResolvedValue(false);
    renderModal();

    await userEvent.setup().click(screen.getByRole('button', { name: 'GUARDAR' }));

    await vi.waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the busy label while the save is in flight', () => {
    viewModelMock.mockReturnValue(aViewModel({ isSubmitting: true }));

    renderModal();

    expect(screen.getByRole('button', { name: 'A GUARDAR…' })).toBeDisabled();
  });

  it('renders the form-level failure the viewmodel mapped', () => {
    viewModelMock.mockReturnValue(
      aViewModel({ formError: 'Já existe um serviço com este nome nesta categoria.' }),
    );

    renderModal();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Já existe um serviço com este nome nesta categoria.',
    );
  });
});

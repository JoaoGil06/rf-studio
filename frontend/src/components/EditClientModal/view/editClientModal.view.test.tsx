import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditClientModal } from './editClientModal.view';

const submitMock = vi.fn();
const viewModelMock = vi.fn();

vi.mock('../viewmodel/editClientModal.viewmodel', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../viewmodel/editClientModal.viewmodel')>()),
  useEditClientModalViewModel: () => viewModelMock(),
}));

const onClose = vi.fn();

function aViewModel(overrides: Record<string, unknown> = {}) {
  return {
    client: {
      id: 'c1',
      name: 'Maria Silva',
      email: 'maria@exemplo.pt',
      phoneNumber: '912345678',
    },
    title: 'Editar cliente',
    submitLabel: 'GUARDAR',
    busyLabel: 'A GUARDAR…',
    register: () => ({ name: 'field' }),
    handleSubmit:
      (onValid: (values: unknown) => unknown) => (event: { preventDefault: () => void }) => {
        event.preventDefault();
        return onValid({
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

function renderModal(clientId: string | null = 'c1') {
  return render(<EditClientModal clientId={clientId} onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewModelMock.mockReturnValue(aViewModel());
  submitMock.mockResolvedValue(true);
});

describe('EditClientModal', () => {
  it('renders nothing while it is closed', () => {
    const { container } = renderModal(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the id points at a client the cache no longer holds', () => {
    viewModelMock.mockReturnValue(aViewModel({ client: null }));

    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
  });

  it('opens on the viewmodel’s title with the form’s edit labels', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Editar cliente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GUARDAR' })).toBeInTheDocument();
  });

  it('offers the three editable fields', () => {
    renderModal();

    expect(screen.getByLabelText('Nome da cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Telemóvel')).toBeInTheDocument();
  });

  it('offers no way to change the date of birth or the role', () => {
    renderModal();

    expect(screen.queryByLabelText(/nascimento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/perfil|role/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('hosts the form in its stacked layout', () => {
    const { baseElement } = renderModal();

    expect(baseElement.querySelector('form')?.className).toContain('formPlain');
  });

  it('closes once the viewmodel reports the client landed', async () => {
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
      aViewModel({ formError: 'Já existe uma cliente com este email.' }),
    );

    renderModal();

    expect(screen.getByRole('alert')).toHaveTextContent('Já existe uma cliente com este email.');
  });
});

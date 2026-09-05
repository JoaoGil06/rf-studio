import { CombinedGraphQLErrors } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { useEditClientModalViewModel } from './editClientModal.viewmodel';

const updateClientMock = vi.fn();
const clientMock = vi.fn();

vi.mock('../model/editClientModal.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/editClientModal.model')>()),
  useEditClientModalModel: (clientId: string | null) => ({
    client: clientMock(clientId),
    updateClient: updateClientMock,
    isSaving: false,
  }),
}));

function aClient(overrides: Record<string, unknown> = {}) {
  return {
    __typename: 'User',
    id: 'c1',
    name: 'Maria Silva',
    email: 'maria@exemplo.pt',
    phoneNumber: '912345678',
    ...overrides,
  };
}

const successPayload = {
  data: { updateUser: { __typename: 'UpdateUserSuccess', user: aClient() } },
};

const conflictPayload = {
  data: {
    updateUser: { __typename: 'UserAlreadyExistsError', message: 'Email already registered' },
  },
};

const notFoundPayload = {
  data: { updateUser: { __typename: 'UserNotFoundError', message: 'User not found' } },
};

const submitResultMock = vi.fn();

function Harness({ initialId }: { initialId: string | null }) {
  const [clientId, setClientId] = useState(initialId);
  const { title, register, handleSubmit, submit, formError } =
    useEditClientModalViewModel(clientId);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        submitResultMock(await submit(values));
      })}
    >
      <span data-testid="title">{title}</span>
      <span data-testid="form-error">{formError ?? ''}</span>

      <input aria-label="nome" {...register('name')} />
      <input aria-label="email" {...register('email')} />
      <input aria-label="telemovel" {...register('phoneNumber')} />

      <button type="button" onClick={() => setClientId('c2')}>
        apontar para c2
      </button>
      <button type="submit">guardar</button>
    </form>
  );
}

function renderHarness(initialId: string | null = 'c1') {
  return render(<Harness initialId={initialId} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  clientMock.mockImplementation((id: string | null) => (id ? aClient({ id }) : null));
  updateClientMock.mockResolvedValue(successPayload);
});

describe('useEditClientModalViewModel — prefilling from the cache', () => {
  it('fills every field from the client it is pointed at', () => {
    renderHarness();

    expect(screen.getByLabelText('nome')).toHaveValue('Maria Silva');
    expect(screen.getByLabelText('email')).toHaveValue('maria@exemplo.pt');
    expect(screen.getByLabelText('telemovel')).toHaveValue('912345678');
  });

  it('titles itself for a client', () => {
    renderHarness();

    expect(screen.getByTestId('title')).toHaveTextContent('Editar cliente');
  });

  it('reads nothing at all while it is closed', () => {
    renderHarness(null);

    expect(screen.getByLabelText('nome')).toHaveValue('');
  });

  it('re-prefills when it is pointed at a different client', async () => {
    clientMock.mockImplementation((id: string | null) =>
      id === 'c2'
        ? aClient({
            id: 'c2',
            name: 'Ana Costa',
            email: 'ana@exemplo.pt',
            phoneNumber: '967000111',
          })
        : aClient(),
    );
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'apontar para c2' }));

    expect(screen.getByLabelText('nome')).toHaveValue('Ana Costa');
    expect(screen.getByLabelText('email')).toHaveValue('ana@exemplo.pt');
    expect(screen.getByLabelText('telemovel')).toHaveValue('967000111');
  });
});

describe('useEditClientModalViewModel — submitting', () => {
  it('sends a full three-field payload carrying the id', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(updateClientMock).toHaveBeenCalledWith({
      variables: {
        input: {
          id: 'c1',
          name: 'Maria Silva',
          email: 'maria@exemplo.pt',
          phoneNumber: '912345678',
        },
      },
    });
  });

  it('never sends a birthDate and never sends a role', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    const input = updateClientMock.mock.calls[0]?.[0].variables.input;
    expect(input).not.toHaveProperty('birthDate');
    expect(input).not.toHaveProperty('role');
  });

  it('reports success so the View can close the modal', async () => {
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(submitResultMock).toHaveBeenCalledWith(true);
  });

  it('does nothing at all while it has no client to save', async () => {
    renderHarness(null);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('nome'), 'Qualquer');
    await user.type(screen.getByLabelText('email'), 'qualquer@exemplo.pt');
    await user.type(screen.getByLabelText('telemovel'), '912345678');
    await user.click(screen.getByRole('button', { name: 'guardar' }));

    expect(updateClientMock).not.toHaveBeenCalled();
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });
});

describe('useEditClientModalViewModel — mapping failures to pt-PT', () => {
  it('maps an email that already belongs to another client', async () => {
    updateClientMock.mockResolvedValue(conflictPayload);
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.alreadyExists);
    expect(submitResultMock).toHaveBeenCalledWith(false);
  });

  it('maps a client that is already gone', async () => {
    updateClientMock.mockResolvedValue(notFoundPayload);
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.notFound);
  });

  it('maps a missing result to the transport message', async () => {
    updateClientMock.mockResolvedValue({ data: null });
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.network);
  });

  it('maps a thrown BAD_USER_INPUT to the validation message', async () => {
    updateClientMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'invalid', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.badInput);
  });

  it('maps any other thrown error to the transport message', async () => {
    updateClientMock.mockRejectedValue(new Error('offline'));
    renderHarness();

    await userEvent.setup().click(screen.getByRole('button', { name: 'guardar' }));

    expect(screen.getByTestId('form-error')).toHaveTextContent(CLIENT_ERROR_MESSAGES.network);
  });
});

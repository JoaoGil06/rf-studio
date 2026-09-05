import { CombinedGraphQLErrors } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { useDeleteClientModalViewModel } from './deleteClientModal.viewmodel';

const deleteClientMock = vi.fn();
const clientMock = vi.fn();

vi.mock('../model/deleteClientModal.model', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/deleteClientModal.model')>()),
  useDeleteClientModalModel: (clientId: string | null) => ({
    client: clientMock(clientId),
    deleteClient: deleteClientMock,
    isDeleting: false,
  }),
}));

function aClient(overrides: Record<string, unknown> = {}) {
  return { __typename: 'User', id: 'c1', name: 'Maria Silva', ...overrides };
}

const successPayload = {
  data: { deleteUser: { __typename: 'DeleteUserSuccess', id: 'c1' } },
};

const notFoundPayload = {
  data: { deleteUser: { __typename: 'UserNotFoundError', message: 'User not found' } },
};

function renderViewModel(clientId: string | null = 'c1') {
  return renderHook(() => useDeleteClientModalViewModel(clientId));
}

beforeEach(() => {
  vi.clearAllMocks();
  clientMock.mockImplementation((id: string | null) => (id ? aClient({ id }) : null));
  deleteClientMock.mockResolvedValue(successPayload);
});

describe('useDeleteClientModalViewModel — what the dialog is handed', () => {
  it('names the client the confirmation is about', () => {
    const { result } = renderViewModel();

    expect(result.current.name).toBe('Maria Silva');
  });

  it('hands over no name while the fragment is missing from the cache', () => {
    clientMock.mockReturnValue(null);

    const { result } = renderViewModel();

    expect(result.current.name).toBeNull();
  });

  it('carries the pt-PT title and both pill labels', () => {
    const { result } = renderViewModel();

    expect(result.current.title).toBe('Remover cliente');
    expect(result.current.keepLabel).toBe('MANTER');
    expect(result.current.removeLabel).toBe('REMOVER');
  });
});

describe('useDeleteClientModalViewModel — confirming', () => {
  it('sends the id and reports no failure when the client is removed', async () => {
    const { result } = renderViewModel();

    await expect(result.current.confirm()).resolves.toBeNull();
    expect(deleteClientMock).toHaveBeenCalledWith({ variables: { input: { id: 'c1' } } });
  });

  it('reports a failure rather than success when it has no id in hand', async () => {
    const { result } = renderViewModel(null);

    await expect(result.current.confirm()).resolves.toBe(CLIENT_ERROR_MESSAGES.deleteFailed);
    expect(deleteClientMock).not.toHaveBeenCalled();
  });

  it('maps a client that is already gone', async () => {
    deleteClientMock.mockResolvedValue(notFoundPayload);
    const { result } = renderViewModel();

    await expect(result.current.confirm()).resolves.toBe(CLIENT_ERROR_MESSAGES.notFound);
  });

  it('maps a missing result to the transport message', async () => {
    deleteClientMock.mockResolvedValue({ data: null });
    const { result } = renderViewModel();

    await expect(result.current.confirm()).resolves.toBe(CLIENT_ERROR_MESSAGES.network);
  });

  it('maps a thrown BAD_USER_INPUT to the validation message', async () => {
    deleteClientMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'invalid', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    const { result } = renderViewModel();

    await expect(result.current.confirm()).resolves.toBe(CLIENT_ERROR_MESSAGES.badInput);
  });

  it('maps a refusal the server answered with to the delete-failed message', async () => {
    deleteClientMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [
          { message: 'foreign key violation', extensions: { code: 'INTERNAL_SERVER_ERROR' } },
        ],
      }),
    );
    const { result } = renderViewModel();

    await expect(result.current.confirm()).resolves.toBe(CLIENT_ERROR_MESSAGES.deleteFailed);
  });

  it('maps a request that never landed to the transport message', async () => {
    deleteClientMock.mockRejectedValue(new Error('offline'));
    const { result } = renderViewModel();

    await expect(result.current.confirm()).resolves.toBe(CLIENT_ERROR_MESSAGES.network);
  });
});

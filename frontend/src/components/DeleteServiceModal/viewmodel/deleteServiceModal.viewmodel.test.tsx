import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCache } from '../../../graphql/cache';
import { SERVICES_PAGE_SIZE, SERVICES_QUERY } from '../../../pages/Services/model/services.model';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { DELETE_SERVICE_MUTATION } from '../model/deleteServiceModal.model';
import { useDeleteServiceModalViewModel } from './deleteServiceModal.viewmodel';

function aNode(id: string, name: string) {
  return {
    __typename: 'Service',
    id,
    name,
    category: 'nails',
    price: 15,
    durationMinutes: 45,
  };
}

const MANICURE = aNode('s1', 'Manicure simples');
const PEDICURE = aNode('s3', 'Pedicure completa');

const SERVICES_VARIABLES = { first: SERVICES_PAGE_SIZE, category: 'nails' as const };

function aConnection(nodes: ReturnType<typeof aNode>[]) {
  return {
    services: {
      __typename: 'ServiceConnection',
      edges: nodes.map((node) => ({
        __typename: 'ServiceEdge',
        cursor: `cursor-${node.id}`,
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        endCursor: `cursor-${nodes[nodes.length - 1]?.id}`,
      },
    },
  };
}

const confirmResultMock = vi.fn();

function Harness({ serviceId }: { serviceId: string | null }) {
  const { name, confirm, isDeleting } = useDeleteServiceModalViewModel(serviceId);

  return (
    <div>
      <span data-testid="name">{name ?? ''}</span>
      <span data-testid="deleting">{isDeleting ? 'sim' : 'nao'}</span>
      <button type="button" onClick={async () => confirmResultMock(await confirm())}>
        remover
      </button>
    </div>
  );
}

function renderHarness(serviceId: string | null = 's1', mocks: MockedResponse[] = []) {
  const cache = createCache();
  cache.writeQuery({
    query: SERVICES_QUERY,
    variables: SERVICES_VARIABLES,
    data: aConnection([MANICURE, PEDICURE]),
  });

  const utils = render(
    <MockedProvider mocks={mocks} cache={cache}>
      <Harness serviceId={serviceId} />
    </MockedProvider>,
  );

  return { ...utils, cache };
}

function aDeleteMock(id: string, result: Record<string, unknown>): MockedResponse {
  return {
    request: { query: DELETE_SERVICE_MUTATION, variables: { input: { id } } },
    result: { data: { deleteService: result } },
  };
}

function readGrid(cache: ReturnType<typeof createCache>) {
  const data = cache.readQuery({ query: SERVICES_QUERY, variables: SERVICES_VARIABLES });
  return (data?.services.edges ?? []).map((edge) => edge.node.id);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDeleteServiceModalViewModel — reading the service', () => {
  it('names the service from the cache the grid filled', () => {
    renderHarness();

    expect(screen.getByTestId('name')).toHaveTextContent('Manicure simples');
  });

  it('reads nothing at all while it is closed', () => {
    renderHarness(null);

    expect(screen.getByTestId('name')).toBeEmptyDOMElement();
  });

  it('reads nothing for a service the cache does not hold', () => {
    renderHarness('missing');

    expect(screen.getByTestId('name')).toBeEmptyDOMElement();
  });
});

describe('useDeleteServiceModalViewModel — the eviction', () => {
  it('removes the service from the cached connection, leaving the rest in place', async () => {
    const { cache } = renderHarness('s1', [
      aDeleteMock('s1', { __typename: 'DeleteServiceSuccess', id: 's1' }),
    ]);

    expect(readGrid(cache)).toEqual(['s1', 's3']);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(confirmResultMock).toHaveBeenCalledWith(null));
    expect(readGrid(cache)).toEqual(['s3']);
  });

  it('leaves the connection untouched when the backend says the service was already gone', async () => {
    const { cache } = renderHarness('s1', [
      aDeleteMock('s1', { __typename: 'ServiceNotFoundError', message: 'not found' }),
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() =>
      expect(confirmResultMock).toHaveBeenCalledWith(SERVICE_ERROR_MESSAGES.notFound),
    );
    expect(readGrid(cache)).toEqual(['s1', 's3']);
  });
});

describe('useDeleteServiceModalViewModel — mapping failures to pt-PT', () => {
  it('returns null on success, so the dialog closes', async () => {
    renderHarness('s1', [aDeleteMock('s1', { __typename: 'DeleteServiceSuccess', id: 's1' })]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(confirmResultMock).toHaveBeenCalledWith(null));
  });

  it('refuses to fire at all without a service, and says so', async () => {
    renderHarness(null);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() =>
      expect(confirmResultMock).toHaveBeenCalledWith(SERVICE_ERROR_MESSAGES.deleteFailed),
    );
  });

  it('maps a transport failure to the network message', async () => {
    renderHarness('s1', [
      {
        request: { query: DELETE_SERVICE_MUTATION, variables: { input: { id: 's1' } } },
        error: new Error('offline'),
      },
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() =>
      expect(confirmResultMock).toHaveBeenCalledWith(SERVICE_ERROR_MESSAGES.network),
    );
  });

  it('maps a BAD_USER_INPUT rejection to the validation message', async () => {
    renderHarness('s1', [
      {
        request: { query: DELETE_SERVICE_MUTATION, variables: { input: { id: 's1' } } },
        result: {
          errors: [{ message: 'invalid id', extensions: { code: 'BAD_USER_INPUT' } }],
        },
      },
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() =>
      expect(confirmResultMock).toHaveBeenCalledWith(SERVICE_ERROR_MESSAGES.badInput),
    );
  });
});

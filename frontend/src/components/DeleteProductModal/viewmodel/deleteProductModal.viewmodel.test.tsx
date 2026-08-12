import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCache } from '../../../graphql/cache';
import { PRODUCTS_PAGE_SIZE, PRODUCTS_QUERY } from '../../../pages/Products/model/products.model';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { DELETE_PRODUCT_MUTATION } from '../model/deleteProductModal.model';
import { useDeleteProductModalViewModel } from './deleteProductModal.viewmodel';

function aNode(id: string, name: string) {
  return {
    __typename: 'Product',
    id,
    name,
    brand: 'OPI',
    category: 'nails',
    color: '#c9a08a',
    isAvailable: true,
  };
}

const NUDE = aNode('p1', 'Nude Rosé');
const BORDEAUX = aNode('p3', 'Bordeaux');

const PRODUCTS_VARIABLES = { first: PRODUCTS_PAGE_SIZE, category: 'nails' };

function aConnection(nodes: ReturnType<typeof aNode>[]) {
  return {
    products: {
      __typename: 'ProductConnection',
      edges: nodes.map((node) => ({
        __typename: 'ProductEdge',
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

function Harness({ productId }: { productId: string | null }) {
  const { name, confirm, isDeleting } = useDeleteProductModalViewModel(productId);

  return (
    <div>
      <span data-testid="name">{name ?? ''}</span>
      <span data-testid="is-deleting">{String(isDeleting)}</span>
      <button type="button" onClick={async () => confirmResultMock(await confirm())}>
        remover
      </button>
    </div>
  );
}

function renderHarness(productId: string | null = 'p1', mocks: MockedResponse[] = []) {
  const cache = createCache();
  cache.writeQuery({
    query: PRODUCTS_QUERY,
    variables: PRODUCTS_VARIABLES,
    data: aConnection([NUDE, BORDEAUX]),
  });

  const utils = render(
    <MockedProvider mocks={mocks} cache={cache}>
      <Harness productId={productId} />
    </MockedProvider>,
  );

  return { ...utils, cache };
}

function aDeleteMock(id: string, result: Record<string, unknown>): MockedResponse {
  return {
    request: { query: DELETE_PRODUCT_MUTATION, variables: { input: { id } } },
    result: { data: { deleteProduct: result } },
  };
}

function readGrid(cache: ReturnType<typeof createCache>) {
  const data = cache.readQuery({ query: PRODUCTS_QUERY, variables: PRODUCTS_VARIABLES });
  return (data?.products.edges ?? []).map((edge) => edge.node.id);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDeleteProductModalViewModel — reading the product', () => {
  it('names the product from the cache the grid filled', () => {
    renderHarness();

    expect(screen.getByTestId('name')).toHaveTextContent('Nude Rosé');
  });

  it('names nothing while it is closed', () => {
    renderHarness(null);

    expect(screen.getByTestId('name')).toBeEmptyDOMElement();
  });
});

describe('useDeleteProductModalViewModel — confirming', () => {
  it('reports success as the absence of a failure', async () => {
    renderHarness('p1', [aDeleteMock('p1', { __typename: 'DeleteProductSuccess', id: 'p1' })]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(confirmResultMock).toHaveBeenCalledWith(null));
  });

  it('evicts the product from the cache', async () => {
    const { cache } = renderHarness('p1', [
      aDeleteMock('p1', { __typename: 'DeleteProductSuccess', id: 'p1' }),
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(cache.extract()['Product:p1']).toBeUndefined());
  });

  it('leaves the grid’s connection no longer yielding that edge', async () => {
    const { cache } = renderHarness('p1', [
      aDeleteMock('p1', { __typename: 'DeleteProductSuccess', id: 'p1' }),
    ]);

    expect(readGrid(cache)).toEqual(['p1', 'p3']);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(readGrid(cache)).toEqual(['p3']));
  });

  it('returns the not-found copy when the product was already gone', async () => {
    renderHarness('p1', [
      aDeleteMock('p1', { __typename: 'ProductNotFoundError', message: 'Product not found' }),
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() =>
      expect(confirmResultMock).toHaveBeenCalledWith(PRODUCT_ERROR_MESSAGES.notFound),
    );
  });

  it('does not evict when the delete was refused', async () => {
    const { cache } = renderHarness('p1', [
      aDeleteMock('p1', { __typename: 'ProductNotFoundError', message: 'Product not found' }),
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(confirmResultMock).toHaveBeenCalled());
    expect(cache.extract()['Product:p1']).toBeDefined();
    expect(readGrid(cache)).toEqual(['p1', 'p3']);
  });

  it('returns the connection copy when the mutation never reached the server', async () => {
    renderHarness('p1', [
      {
        request: { query: DELETE_PRODUCT_MUTATION, variables: { input: { id: 'p1' } } },
        error: new Error('Failed to fetch'),
      },
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() =>
      expect(confirmResultMock).toHaveBeenCalledWith(PRODUCT_ERROR_MESSAGES.network),
    );
  });

  it('does not evict when the mutation threw', async () => {
    const { cache } = renderHarness('p1', [
      {
        request: { query: DELETE_PRODUCT_MUTATION, variables: { input: { id: 'p1' } } },
        error: new Error('Failed to fetch'),
      },
    ]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'remover' }));

    await vi.waitFor(() => expect(confirmResultMock).toHaveBeenCalled());
    expect(readGrid(cache)).toEqual(['p1', 'p3']);
  });
});

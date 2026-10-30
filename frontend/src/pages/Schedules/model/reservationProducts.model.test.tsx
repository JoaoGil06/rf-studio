import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { createCache } from '../../../graphql/cache';
import { PRODUCTS_QUERY } from '../../Products/model/products.model';
import {
  PRODUCTS_PICKER_PAGE_SIZE,
  RESERVATION_PRODUCTS_QUERY,
  useReservationProductsModel,
} from './schedules.model';

function aPage(ids: string[], hasNextPage: boolean, endCursor: string | null = null) {
  return {
    products: {
      __typename: 'ProductConnection' as const,
      edges: ids.map((id) => ({
        __typename: 'ProductEdge' as const,
        cursor: `cursor-${id}`,
        node: {
          __typename: 'Product' as const,
          id,
          name: `Produto ${id}`,
          brand: 'Andreia',
          category: 'nails',
          color: '#75D2D5',
          isAvailable: true,
        },
      })),
      pageInfo: { __typename: 'PageInfo' as const, hasNextPage, endCursor },
    },
  };
}

function aPageMock(
  after: string | undefined,
  data: ReturnType<typeof aPage>,
  onRequest = vi.fn(),
): MockedResponse {
  return {
    request: {
      query: RESERVATION_PRODUCTS_QUERY,
      variables: { first: PRODUCTS_PICKER_PAGE_SIZE, ...(after ? { after } : {}) },
    },
    result: () => {
      onRequest();
      return { data };
    },
  };
}

function Harness({ isEnabled }: { isEnabled: boolean }) {
  const { products, hasMoreProducts, isLoading } = useReservationProductsModel(isEnabled);

  return (
    <div>
      <span data-testid="ids">{products.map((edge) => edge.node.id).join(',')}</span>
      <span data-testid="has-more">{String(hasMoreProducts)}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
    </div>
  );
}

function renderHarness(mocks: MockedResponse[], isEnabled = true, cache = createCache()) {
  render(
    <MockedProvider mocks={mocks} cache={cache}>
      <Harness isEnabled={isEnabled} />
    </MockedProvider>,
  );

  return cache;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('useReservationProductsModel', () => {
  it('fires nothing while disabled', async () => {
    const onRequest = vi.fn();
    renderHarness([aPageMock(undefined, aPage(['p1'], false), onRequest)], false);

    await settle();

    expect(onRequest).not.toHaveBeenCalled();
    expect(screen.getByTestId('ids')).toBeEmptyDOMElement();
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('stops after one request when one page holds everything', async () => {
    const onSecond = vi.fn();
    renderHarness([
      aPageMock(undefined, aPage(['p1'], false)),
      aPageMock('cursor-p1', aPage(['p2'], false), onSecond),
    ]);

    await vi.waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent('p1'));
    await settle();

    expect(onSecond).not.toHaveBeenCalled();
    expect(screen.getByTestId('has-more')).toHaveTextContent('false');
  });

  it('reads every page, so a product past the cap can still be picked', async () => {
    renderHarness([
      aPageMock(undefined, aPage(['p1'], true, 'cursor-p1')),
      aPageMock('cursor-p1', aPage(['p2'], true, 'cursor-p2')),
      aPageMock('cursor-p2', aPage(['p3'], false, 'cursor-p3')),
    ]);

    await vi.waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent('p1,p2,p3'));
    expect(screen.getByTestId('has-more')).toHaveTextContent('false');
  });

  it('asks for a failed page only once, and reports the list as incomplete', async () => {
    const onRetry = vi.fn();
    renderHarness([
      aPageMock(undefined, aPage(['p1'], true, 'cursor-p1')),
      {
        request: {
          query: RESERVATION_PRODUCTS_QUERY,
          variables: { first: PRODUCTS_PICKER_PAGE_SIZE, after: 'cursor-p1' },
        },
        error: new Error('Failed to fetch'),
      },
      aPageMock('cursor-p1', aPage(['p2'], false, 'cursor-p2'), onRetry),
    ]);

    await vi.waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent('p1'));
    await settle();

    expect(onRetry).not.toHaveBeenCalled();
    expect(screen.getByTestId('ids')).toHaveTextContent('p1');
    expect(screen.getByTestId('has-more')).toHaveTextContent('true');
  });

  it('keeps its list apart from the Produtos page’s', async () => {
    const cache = createCache();
    const produtos = {
      products: {
        __typename: 'ProductConnection' as const,
        edges: [],
        pageInfo: { __typename: 'PageInfo' as const, hasNextPage: false, endCursor: null },
      },
    };
    cache.writeQuery({
      query: PRODUCTS_QUERY,
      variables: { first: 25, category: 'nails' },
      data: produtos,
    });

    renderHarness([aPageMock(undefined, aPage(['p1'], false))], true, cache);

    await vi.waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent('p1'));
    expect(
      cache.readQuery({ query: PRODUCTS_QUERY, variables: { first: 25, category: 'nails' } })
        ?.products.edges,
    ).toEqual([]);
  });
});

import { NetworkStatus } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { PRODUCTS_PAGE_SIZE, PRODUCTS_QUERY, useProductsModel } from './products.model';

const useQueryMock = vi.fn();
const fetchMoreMock = vi.fn();
const registerProductMock = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: () => [registerProductMock, { loading: false }],
}));

function aQueryResult(
  overrides: {
    hasNextPage?: boolean;
    endCursor?: string | null;
    networkStatus?: NetworkStatus;
  } = {},
) {
  return {
    data: {
      products: {
        edges: [{ cursor: 'cursor-p3', node: { id: 'p3' } }],
        pageInfo: {
          hasNextPage: overrides.hasNextPage ?? true,
          endCursor: overrides.endCursor === undefined ? 'cursor-p3' : overrides.endCursor,
        },
      },
    },
    loading: false,
    error: undefined,
    networkStatus: overrides.networkStatus ?? NetworkStatus.ready,
    fetchMore: fetchMoreMock,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useQueryMock.mockReturnValue(aQueryResult());
});

describe('useProductsModel — the category is a query variable, not a client filter', () => {
  it('asks the server for one page of the given category', () => {
    renderHook(() => useProductsModel('eyebrows'));

    expect(useQueryMock).toHaveBeenCalledWith(
      PRODUCTS_QUERY,
      expect.objectContaining({
        variables: { first: PRODUCTS_PAGE_SIZE, category: 'eyebrows' },
      }),
    );
  });

  it('fetches 25 at a time, not the whole catalogue', () => {
    expect(PRODUCTS_PAGE_SIZE).toBe(25);
  });
});

describe('useProductsModel — paging through the catalogue', () => {
  it('asks for the next page after the last cursor it holds', async () => {
    const { result } = renderHook(() => useProductsModel('nails'));

    await act(() => result.current.loadMore());

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: { first: PRODUCTS_PAGE_SIZE, after: 'cursor-p3', category: 'nails' },
    });
  });

  // The cache keys this connection on `category`; a page fetched without it would
  // be merged into a different list than the one on screen.
  it('carries the active category into the next page', async () => {
    const { result } = renderHook(() => useProductsModel('eyebrows'));

    await act(() => result.current.loadMore());

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: { first: PRODUCTS_PAGE_SIZE, after: 'cursor-p3', category: 'eyebrows' },
    });
  });

  /**
   * The first of the two locks: `canLoadMore` is what the sentinel watches on, so
   * while it is false nothing ever asks for another page.
   */
  it('closes paging once the last page has been read', () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useProductsModel('nails'));

    expect(result.current.canLoadMore).toBe(false);
  });

  it('closes paging while a page is already in flight', () => {
    useQueryMock.mockReturnValue(aQueryResult({ networkStatus: NetworkStatus.fetchMore }));

    const { result } = renderHook(() => useProductsModel('nails'));

    expect(result.current.canLoadMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(true);
  });

  it('opens paging while there is a page left and nothing in flight', () => {
    const { result } = renderHook(() => useProductsModel('nails'));

    expect(result.current.canLoadMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  /**
   * The second lock, on the case the first cannot cover: the server says there is
   * another page but hands back no cursor to page past. Calling `loadMore` must not
   * turn that into a request for `after: null`, which would re-fetch page one and
   * append it to itself.
   */
  it('does not ask for a page it has no cursor for', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: true, endCursor: null }));

    const { result } = renderHook(() => useProductsModel('nails'));
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not page past the last page even if asked directly', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useProductsModel('nails'));
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  // `loading` covers the first page; `isLoadingMore` is specifically a list that
  // already has entries and is growing underneath them.
  it('tells a first load apart from a growing list', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      networkStatus: NetworkStatus.loading,
      fetchMore: fetchMoreMock,
    });

    const { result } = renderHook(() => useProductsModel('nails'));

    expect(result.current.loading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('reports no next page when the query has returned nothing yet', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      networkStatus: NetworkStatus.loading,
      fetchMore: fetchMoreMock,
    });

    const { result } = renderHook(() => useProductsModel('nails'));

    expect(result.current.canLoadMore).toBe(false);
  });
});

import { NetworkStatus } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { CLIENTS_PAGE_SIZE, CLIENTS_QUERY, useClientsModel } from './clients.model';

const useQueryMock = vi.fn();
const fetchMoreMock = vi.fn();
const registerClientMock = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: () => [registerClientMock, { loading: false }],
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
      users: {
        edges: [{ cursor: 'cursor-c3', node: { id: 'c3' } }],
        pageInfo: {
          hasNextPage: overrides.hasNextPage ?? true,
          endCursor: overrides.endCursor === undefined ? 'cursor-c3' : overrides.endCursor,
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

describe('useClientsModel — the client book is a filtered connection', () => {
  it('asks the server for one page of client-role users only', () => {
    renderHook(() => useClientsModel());

    expect(useQueryMock).toHaveBeenCalledWith(
      CLIENTS_QUERY,
      expect.objectContaining({
        variables: { first: CLIENTS_PAGE_SIZE, role: 'client' },
      }),
    );
  });

  /**
   * Without it `networkStatus` never reaches `fetchMore`, `isLoadingMore` never
   * turns true, and nothing stops the observer sending the same cursor twice.
   */
  it('watches the network status, which is what makes fetchMore observable', () => {
    renderHook(() => useClientsModel());

    expect(useQueryMock).toHaveBeenCalledWith(
      CLIENTS_QUERY,
      expect.objectContaining({ notifyOnNetworkStatusChange: true }),
    );
  });

  it('fetches 25 at a time, not the whole book', () => {
    expect(CLIENTS_PAGE_SIZE).toBe(25);
  });
});

describe('useClientsModel — paging through the book', () => {
  it('asks for the next page after the last cursor it holds', async () => {
    const { result } = renderHook(() => useClientsModel());

    await act(() => result.current.loadMore());

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: { first: CLIENTS_PAGE_SIZE, after: 'cursor-c3', role: 'client' },
    });
  });

  // The cache keys this connection on `role`; a page fetched without it would be
  // merged into a different list than the one on screen.
  it('carries the role into the next page', async () => {
    const { result } = renderHook(() => useClientsModel());

    await act(() => result.current.loadMore());

    expect(fetchMoreMock.mock.calls[0]?.[0].variables.role).toBe('client');
  });

  it('closes paging once the last page has been read', () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useClientsModel());

    expect(result.current.canLoadMore).toBe(false);
  });

  it('closes paging while a page is already in flight', () => {
    useQueryMock.mockReturnValue(aQueryResult({ networkStatus: NetworkStatus.fetchMore }));

    const { result } = renderHook(() => useClientsModel());

    expect(result.current.canLoadMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(true);
  });

  it('opens paging while there is a page left and nothing in flight', () => {
    const { result } = renderHook(() => useClientsModel());

    expect(result.current.canLoadMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('does not ask for a page it has no cursor for', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: true, endCursor: null }));

    const { result } = renderHook(() => useClientsModel());
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not page past the last page even if asked directly', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useClientsModel());
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not send the same cursor twice while a page is in flight', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ networkStatus: NetworkStatus.fetchMore }));

    const { result } = renderHook(() => useClientsModel());
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  // `loading` covers the first page; `isLoadingMore` is specifically a list that
  // already has rows and is growing underneath them.
  it('tells a first load apart from a growing list', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      networkStatus: NetworkStatus.loading,
      fetchMore: fetchMoreMock,
    });

    const { result } = renderHook(() => useClientsModel());

    expect(result.current.loading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.canLoadMore).toBe(false);
  });
});

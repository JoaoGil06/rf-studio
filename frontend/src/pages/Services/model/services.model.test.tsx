import { NetworkStatus } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { SERVICE_DELETE_FRAGMENT } from '../../../components/DeleteServiceModal/model/deleteServiceModal.model';
import { SERVICE_EDIT_FRAGMENT } from '../../../components/EditServiceModal/model/editServiceModal.model';
import { createCache } from '../../../graphql/cache';
import { SERVICES_PAGE_SIZE, SERVICES_QUERY, useServicesModel } from './services.model';

const useQueryMock = vi.fn();
const fetchMoreMock = vi.fn();
const registerServiceMock = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: () => [registerServiceMock, { loading: false }],
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
      services: {
        edges: [{ cursor: 'cursor-s3', node: { id: 's3' } }],
        pageInfo: {
          hasNextPage: overrides.hasNextPage ?? true,
          endCursor: overrides.endCursor === undefined ? 'cursor-s3' : overrides.endCursor,
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

describe('useServicesModel — the category is a query variable, not a client filter', () => {
  it('asks the server for one page of the given category', () => {
    renderHook(() => useServicesModel('eyebrows'));

    expect(useQueryMock).toHaveBeenCalledWith(
      SERVICES_QUERY,
      expect.objectContaining({
        variables: { first: SERVICES_PAGE_SIZE, category: 'eyebrows' },
      }),
    );
  });

  it('watches the network status, which is what makes fetchMore observable', () => {
    renderHook(() => useServicesModel('nails'));

    expect(useQueryMock).toHaveBeenCalledWith(
      SERVICES_QUERY,
      expect.objectContaining({ notifyOnNetworkStatusChange: true }),
    );
  });

  it('fetches 25 at a time, not the whole catalogue', () => {
    expect(SERVICES_PAGE_SIZE).toBe(25);
  });
});

describe('useServicesModel — paging through the catalogue', () => {
  it('asks for the next page after the last cursor it holds', async () => {
    const { result } = renderHook(() => useServicesModel('nails'));

    await act(() => result.current.loadMore());

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: { first: SERVICES_PAGE_SIZE, after: 'cursor-s3', category: 'nails' },
    });
  });

  // The cache keys this connection on `category`; a page fetched without it would
  // be merged into a different list than the one on screen.
  it('carries the active category into the next page', async () => {
    const { result } = renderHook(() => useServicesModel('eyebrows'));

    await act(() => result.current.loadMore());

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: { first: SERVICES_PAGE_SIZE, after: 'cursor-s3', category: 'eyebrows' },
    });
  });

  it('closes paging once the last page has been read', () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useServicesModel('nails'));

    expect(result.current.canLoadMore).toBe(false);
  });

  it('closes paging while a page is already in flight', () => {
    useQueryMock.mockReturnValue(aQueryResult({ networkStatus: NetworkStatus.fetchMore }));

    const { result } = renderHook(() => useServicesModel('nails'));

    expect(result.current.canLoadMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(true);
  });

  it('opens paging while there is a page left and nothing in flight', () => {
    const { result } = renderHook(() => useServicesModel('nails'));

    expect(result.current.canLoadMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('does not ask for a page it has no cursor for', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: true, endCursor: null }));

    const { result } = renderHook(() => useServicesModel('nails'));
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not page past the last page even if asked directly', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useServicesModel('nails'));
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not send the same cursor twice while a page is in flight', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ networkStatus: NetworkStatus.fetchMore }));

    const { result } = renderHook(() => useServicesModel('nails'));
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

    const { result } = renderHook(() => useServicesModel('nails'));

    expect(result.current.loading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.canLoadMore).toBe(false);
  });
});

describe('SERVICES_QUERY — the fragments the modals depend on', () => {
  const VARIABLES = { first: SERVICES_PAGE_SIZE, category: 'nails' as const };

  function aNode() {
    return {
      __typename: 'Service',
      id: 's1',
      name: 'Manicure simples',
      category: 'nails',
      price: 15,
      durationMinutes: 45,
    };
  }

  function aConnection() {
    return {
      services: {
        __typename: 'ServiceConnection',
        edges: [{ __typename: 'ServiceEdge', cursor: 'cursor-s1', node: aNode() }],
        pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: 'cursor-s1' },
      },
    };
  }

  function aFilledCache() {
    const cache = createCache();
    cache.writeQuery({ query: SERVICES_QUERY, variables: VARIABLES, data: aConnection() });

    return cache;
  }

  it('leaves the edit modal a complete fragment to prefill from', () => {
    const edit = aFilledCache().readFragment({
      id: 'Service:s1',
      fragment: SERVICE_EDIT_FRAGMENT,
      fragmentName: 'ServiceEditFields',
    });

    expect(edit).toEqual(
      expect.objectContaining({
        id: 's1',
        name: 'Manicure simples',
        price: 15,
        durationMinutes: 45,
      }),
    );
  });

  it('leaves the delete modal a complete fragment to name the service from', () => {
    const remove = aFilledCache().readFragment({
      id: 'Service:s1',
      fragment: SERVICE_DELETE_FRAGMENT,
      fragmentName: 'ServiceDeleteFields',
    });

    expect(remove).toEqual(expect.objectContaining({ id: 's1', name: 'Manicure simples' }));
  });
});

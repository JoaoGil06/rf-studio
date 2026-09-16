import { NetworkStatus } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import type { ScheduleStatus } from '../../../graphql/generated/graphql';
import { SCHEDULES_PAGE_SIZE, SCHEDULES_QUERY, useSchedulesModel } from './schedules.model';

const useQueryMock = vi.fn();
const fetchMoreMock = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
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
      schedules: {
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

describe('useSchedulesModel — one tab is one filtered connection', () => {
  it('asks the server for one page of reservations in the given state', () => {
    renderHook(() => useSchedulesModel('pending'));

    expect(useQueryMock).toHaveBeenCalledWith(
      SCHEDULES_QUERY,
      expect.objectContaining({
        variables: { first: SCHEDULES_PAGE_SIZE, filter: { status: 'pending' } },
      }),
    );
  });

  it('refetches behind the cached rows, so a booking made in the Agenda shows up', () => {
    renderHook(() => useSchedulesModel('pending'));

    expect(useQueryMock).toHaveBeenCalledWith(
      SCHEDULES_QUERY,
      expect.objectContaining({ fetchPolicy: 'cache-and-network' }),
    );
  });

  it('watches the network status, which is what makes fetchMore observable', () => {
    renderHook(() => useSchedulesModel('pending'));

    expect(useQueryMock).toHaveBeenCalledWith(
      SCHEDULES_QUERY,
      expect.objectContaining({ notifyOnNetworkStatusChange: true }),
    );
  });

  it('fetches 25 at a time', () => {
    expect(SCHEDULES_PAGE_SIZE).toBe(25);
  });

  it('asks for the new state when the tab changes', () => {
    const { rerender } = renderHook(({ status }) => useSchedulesModel(status), {
      initialProps: { status: 'pending' as ScheduleStatus },
    });

    rerender({ status: 'cancelled' });

    expect(useQueryMock).toHaveBeenLastCalledWith(
      SCHEDULES_QUERY,
      expect.objectContaining({
        variables: { first: SCHEDULES_PAGE_SIZE, filter: { status: 'cancelled' } },
      }),
    );
  });
});

describe('useSchedulesModel — paging through a tab', () => {
  it('asks for the next page after the last cursor, carrying the same filter', async () => {
    const { result } = renderHook(() => useSchedulesModel('confirmed'));

    await act(() => result.current.loadMore());

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: {
        first: SCHEDULES_PAGE_SIZE,
        after: 'cursor-s3',
        filter: { status: 'confirmed' },
      },
    });
  });

  it('opens paging while there is a page left and nothing in flight', () => {
    const { result } = renderHook(() => useSchedulesModel('pending'));

    expect(result.current.canLoadMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('closes paging once the last page has been read', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: false }));

    const { result } = renderHook(() => useSchedulesModel('pending'));
    await act(() => result.current.loadMore());

    expect(result.current.canLoadMore).toBe(false);
    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not send the same cursor twice while a page is in flight', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ networkStatus: NetworkStatus.fetchMore }));

    const { result } = renderHook(() => useSchedulesModel('pending'));
    await act(() => result.current.loadMore());

    expect(result.current.isLoadingMore).toBe(true);
    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('does not ask for a page it has no cursor for', async () => {
    useQueryMock.mockReturnValue(aQueryResult({ hasNextPage: true, endCursor: null }));

    const { result } = renderHook(() => useSchedulesModel('pending'));
    await act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });

  it('tells a first load apart from a growing list', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      networkStatus: NetworkStatus.loading,
      fetchMore: fetchMoreMock,
    });

    const { result } = renderHook(() => useSchedulesModel('pending'));

    expect(result.current.loading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.canLoadMore).toBe(false);
  });
});

import { NetworkStatus } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useCallback, useMemo } from 'react';
import { graphql } from '../../../graphql/generated';
import type { ScheduleStatus } from '../../../graphql/generated/graphql';

export const SCHEDULES_PAGE_SIZE = 25;

export const SCHEDULES_QUERY = graphql(`
  query Schedules($first: Int, $after: String, $filter: SchedulesFilter) {
    schedules(first: $first, after: $after, filter: $filter) {
      edges {
        cursor
        node {
          id
          ...ReservationRowFields
          ...ReservationStatusFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export function useSchedulesModel(status: ScheduleStatus) {
  const filter = useMemo(() => ({ status }), [status]);

  const { data, loading, error, networkStatus, fetchMore } = useQuery(SCHEDULES_QUERY, {
    variables: { first: SCHEDULES_PAGE_SIZE, filter },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const endCursor = useMemo(
    () => data?.schedules.pageInfo.endCursor ?? null,
    [data?.schedules.pageInfo.endCursor],
  );

  const isLoadingMore = useMemo(() => networkStatus === NetworkStatus.fetchMore, [networkStatus]);

  const canLoadMore = useMemo(
    () => (data?.schedules.pageInfo.hasNextPage ?? false) && !isLoadingMore,
    [data?.schedules.pageInfo.hasNextPage, isLoadingMore],
  );

  const loadMore = useCallback(async () => {
    if (!canLoadMore || !endCursor) {
      return;
    }

    await fetchMore({ variables: { first: SCHEDULES_PAGE_SIZE, after: endCursor, filter } });
  }, [canLoadMore, endCursor, fetchMore, filter]);

  return { data, loading, error, isLoadingMore, canLoadMore, loadMore };
}

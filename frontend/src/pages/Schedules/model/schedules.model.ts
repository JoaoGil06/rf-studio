import { NetworkStatus } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo } from 'react';
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
          ...CompleteReservationFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const PRODUCTS_PICKER_PAGE_SIZE = 100;

export const RESERVATION_PRODUCTS_QUERY = graphql(`
  query ReservationProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          brand
          category
          color
          isAvailable
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export function useReservationProductsModel(isEnabled: boolean) {
  const { data, networkStatus, fetchMore } = useQuery(RESERVATION_PRODUCTS_QUERY, {
    variables: { first: PRODUCTS_PICKER_PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
    skip: !isEnabled,
    // Keeps the network status steady through `fetchMore`: a failed page then changes
    // nothing the effect depends on, so it cannot retry in a loop.
    notifyOnNetworkStatusChange: false,
  });

  const isReady = networkStatus === NetworkStatus.ready;
  const hasNextPage = data?.products.pageInfo.hasNextPage ?? false;
  const endCursor = data?.products.pageInfo.endCursor ?? null;

  // `products` caps a page at 100, and a polish past the cap must still be pickable.
  useEffect(() => {
    if (!isReady || !hasNextPage || !endCursor) {
      return;
    }

    void fetchMore({
      variables: { first: PRODUCTS_PICKER_PAGE_SIZE, after: endCursor },
    }).catch(() => undefined);
  }, [isReady, hasNextPage, endCursor, fetchMore]);

  const products = useMemo(() => data?.products.edges ?? [], [data]);

  const isLoading = useMemo(
    () => !data && networkStatus === NetworkStatus.loading,
    [data, networkStatus],
  );

  return { products, hasMoreProducts: hasNextPage, isLoading };
}

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

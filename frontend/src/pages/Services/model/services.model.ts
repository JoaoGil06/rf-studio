import { NetworkStatus } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useMemo } from 'react';
import { graphql } from '../../../graphql/generated';
import type { CategoryValue } from '../../../utils/constants/categories';

export const SERVICES_PAGE_SIZE = 25;

export const SERVICES_QUERY = graphql(`
  query Services($first: Int, $after: String, $category: ServiceCategory) {
    services(first: $first, after: $after, category: $category) {
      edges {
        cursor
        node {
          id
          ...ServiceCardFields
          ...ServiceEditFields
          ...ServiceDeleteFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const REGISTER_SERVICE_MUTATION = graphql(`
  mutation RegisterService($input: RegisterServiceInput!) {
    registerService(input: $input) {
      __typename
      ... on RegisterServiceSuccess {
        service {
          id
          ...ServiceCardFields
        }
      }
      ... on ServiceAlreadyExistsError {
        message
      }
    }
  }
`);

export function useServicesModel(category: CategoryValue) {
  const variables = { first: SERVICES_PAGE_SIZE, category };

  const { data, loading, error, networkStatus, fetchMore } = useQuery(SERVICES_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  /**
   * Refetching the first page rather than splicing an edge into the cache:
   * `relayStylePagination` derives `endCursor` from the last edge it holds, so an
   * invented cursor breaks the next `fetchMore`.
   */
  const [registerService] = useMutation(REGISTER_SERVICE_MUTATION, {
    refetchQueries: [{ query: SERVICES_QUERY, variables }],
    awaitRefetchQueries: true,
  });

  const endCursor = useMemo(
    () => data?.services.pageInfo.endCursor ?? null,
    [data?.services.pageInfo.endCursor],
  );

  const isLoadingMore = useMemo(() => networkStatus === NetworkStatus.fetchMore, [networkStatus]);

  const canLoadMore = useMemo(
    () => (data?.services.pageInfo.hasNextPage ?? false) && !isLoadingMore,
    [data?.services.pageInfo.hasNextPage, isLoadingMore],
  );

  const loadMore = useCallback(async () => {
    if (!canLoadMore || !endCursor) {
      return;
    }

    await fetchMore({ variables: { first: SERVICES_PAGE_SIZE, after: endCursor, category } });
  }, [canLoadMore, endCursor, fetchMore, category]);

  return { data, loading, error, isLoadingMore, canLoadMore, loadMore, registerService };
}

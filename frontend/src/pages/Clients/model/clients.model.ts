import { NetworkStatus } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useMemo } from 'react';
import { graphql } from '../../../graphql/generated';

export const CLIENTS_PAGE_SIZE = 25;

// There is no tab and no filter on this page, so the role is a module constant
// baked into the variables rather than a parameter the caller chooses.
const CLIENT_ROLE = 'client' as const;

export const CLIENTS_QUERY = graphql(`
  query Clients($first: Int, $after: String, $role: RoleName) {
    users(first: $first, after: $after, role: $role) {
      edges {
        cursor
        node {
          id
          ...ClientRowFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const REGISTER_CLIENT_MUTATION = graphql(`
  mutation RegisterClient($input: RegisterUserInput!) {
    registerUser(input: $input) {
      __typename
      ... on RegisterUserSuccess {
        user {
          id
          ...ClientRowFields
        }
      }
      ... on UserAlreadyExistsError {
        message
      }
    }
  }
`);

export function useClientsModel() {
  const variables = { first: CLIENTS_PAGE_SIZE, role: CLIENT_ROLE };

  const { data, loading, error, networkStatus, fetchMore } = useQuery(CLIENTS_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  /**
   * Refetching the first page rather than splicing an edge into the cache:
   * `relayStylePagination` derives `endCursor` from the last edge it holds, so an
   * invented cursor breaks the next `fetchMore`. This lands the new client on the
   * list only because the backend orders users `desc(createdAt)` — against the old
   * ascending order the refetched first page would not contain her past 25 rows.
   */
  const [registerClient] = useMutation(REGISTER_CLIENT_MUTATION, {
    refetchQueries: [{ query: CLIENTS_QUERY, variables }],
    awaitRefetchQueries: true,
  });

  const endCursor = useMemo(
    () => data?.users.pageInfo.endCursor ?? null,
    [data?.users.pageInfo.endCursor],
  );

  const isLoadingMore = useMemo(() => networkStatus === NetworkStatus.fetchMore, [networkStatus]);

  const canLoadMore = useMemo(
    () => (data?.users.pageInfo.hasNextPage ?? false) && !isLoadingMore,
    [data?.users.pageInfo.hasNextPage, isLoadingMore],
  );

  const loadMore = useCallback(async () => {
    if (!canLoadMore || !endCursor) {
      return;
    }

    await fetchMore({
      variables: { first: CLIENTS_PAGE_SIZE, after: endCursor, role: CLIENT_ROLE },
    });
  }, [canLoadMore, endCursor, fetchMore]);

  return { data, loading, error, isLoadingMore, canLoadMore, loadMore, registerClient };
}

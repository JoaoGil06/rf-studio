import { NetworkStatus } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useMemo } from 'react';
import { graphql } from '../../../graphql/generated';

export const PRODUCTS_PAGE_SIZE = 25;

export const PRODUCTS_QUERY = graphql(`
  query Products($first: Int, $after: String, $category: String) {
    products(first: $first, after: $after, category: $category) {
      edges {
        cursor
        node {
          id
          ...ProductCardFields
          ...ProductEditFields
          ...ProductDeleteFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const REGISTER_PRODUCT_MUTATION = graphql(`
  mutation RegisterProduct($input: RegisterProductInput!) {
    registerProduct(input: $input) {
      __typename
      ... on RegisterProductSuccess {
        product {
          id
          ...ProductCardFields
        }
      }
      ... on ProductAlreadyExistsError {
        message
      }
    }
  }
`);

export function useProductsModel(category: string) {
  const variables = { first: PRODUCTS_PAGE_SIZE, category };

  // Changing `category` changes the variables, so Apollo issues the new query on its own
  const { data, loading, error, networkStatus, fetchMore } = useQuery(PRODUCTS_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const [registerProduct] = useMutation(REGISTER_PRODUCT_MUTATION, {
    refetchQueries: [{ query: PRODUCTS_QUERY, variables }],
    awaitRefetchQueries: true,
  });

  const endCursor = useMemo(
    () => data?.products.pageInfo.endCursor ?? null,
    [data?.products.pageInfo.endCursor],
  );

  const isLoadingMore = useMemo(() => networkStatus === NetworkStatus.fetchMore, [networkStatus]);

  const canLoadMore = useMemo(
    () => (data?.products.pageInfo.hasNextPage ?? false) && !isLoadingMore,
    [data?.products.pageInfo.hasNextPage, isLoadingMore],
  );

  const loadMore = useCallback(async () => {
    if (!canLoadMore || !endCursor) {
      return;
    }

    await fetchMore({ variables: { first: PRODUCTS_PAGE_SIZE, after: endCursor, category } });
  }, [canLoadMore, endCursor, fetchMore, category]);

  return { data, loading, error, isLoadingMore, canLoadMore, loadMore, registerProduct };
}

import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const PRODUCT_DELETE_FRAGMENT = graphql(`
  fragment ProductDeleteFields on Product {
    id
    name
  }
`);

export const DELETE_PRODUCT_MUTATION = graphql(`
  mutation DeleteProduct($input: DeleteProductInput!) {
    deleteProduct(input: $input) {
      __typename
      ... on DeleteProductSuccess {
        id
      }
      ... on ProductNotFoundError {
        message
      }
    }
  }
`);

export function useDeleteProductModalModel(productId: string | null) {
  const { data, complete } = useFragment({
    fragment: PRODUCT_DELETE_FRAGMENT,
    fragmentName: 'ProductDeleteFields',
    from: productId ? { __typename: 'Product' as const, id: productId } : null,
  });

  const [deleteProduct, { loading }] = useMutation(DELETE_PRODUCT_MUTATION, {
    update(cache, { data: result }) {
      if (result?.deleteProduct.__typename !== 'DeleteProductSuccess') {
        return;
      }

      const cacheId = cache.identify({ __typename: 'Product', id: result.deleteProduct.id });
      if (!cacheId) {
        return;
      }
      cache.evict({ id: cacheId });
      cache.gc();
    },
  });

  return { product: complete ? data : null, deleteProduct, isDeleting: loading };
}

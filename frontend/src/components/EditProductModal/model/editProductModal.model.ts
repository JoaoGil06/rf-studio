import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const PRODUCT_EDIT_FRAGMENT = graphql(`
  fragment ProductEditFields on Product {
    id
    name
    brand
    category
    color
    isAvailable
  }
`);

export const UPDATE_PRODUCT_MUTATION = graphql(`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      __typename
      ... on UpdateProductSuccess {
        product {
          id
          ...ProductCardFields
          ...ProductEditFields
          ...ProductDeleteFields
        }
      }
      ... on ProductAlreadyExistsError {
        message
      }
      ... on ProductNotFoundError {
        message
      }
    }
  }
`);

export function useEditProductModalModel(productId: string | null) {
  const { data, complete } = useFragment({
    fragment: PRODUCT_EDIT_FRAGMENT,
    fragmentName: 'ProductEditFields',
    from: productId ? { __typename: 'Product' as const, id: productId } : null,
  });

  const [updateProduct, { loading }] = useMutation(UPDATE_PRODUCT_MUTATION);

  return { product: complete ? data : null, updateProduct, isSaving: loading };
}

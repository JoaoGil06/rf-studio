import { useFragment } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const PRODUCT_CARD_FRAGMENT = graphql(`
  fragment ProductCardFields on Product {
    id
    name
    brand
    category
    color
    isAvailable
  }
`);

export function useProductCardModel(id: string) {
  const { data, complete } = useFragment({
    fragment: PRODUCT_CARD_FRAGMENT,
    fragmentName: 'ProductCardFields',
    from: { __typename: 'Product', id },
  });

  return { product: complete ? data : null };
}

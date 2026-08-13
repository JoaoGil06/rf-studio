import { useFragment } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const SERVICE_CARD_FRAGMENT = graphql(`
  fragment ServiceCardFields on Service {
    id
    name
    category
    price
    durationMinutes
  }
`);

export function useServiceCardModel(id: string) {
  const { data, complete } = useFragment({
    fragment: SERVICE_CARD_FRAGMENT,
    fragmentName: 'ServiceCardFields',
    from: { __typename: 'Service', id },
  });

  return { service: complete ? data : null };
}

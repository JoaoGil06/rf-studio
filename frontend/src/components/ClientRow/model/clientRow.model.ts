import { useFragment } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

/**
 * `role` is deliberately absent: the query already filters the connection to
 * clients, so selecting it per row would cost a `Role` cache entry and a
 * DataLoader hit each, to re-prove something the query guaranteed.
 */
export const CLIENT_ROW_FRAGMENT = graphql(`
  fragment ClientRowFields on User {
    id
    name
    email
    phoneNumber
  }
`);

export function useClientRowModel(id: string) {
  const { data, complete } = useFragment({
    fragment: CLIENT_ROW_FRAGMENT,
    fragmentName: 'ClientRowFields',
    from: { __typename: 'User', id },
  });

  return { client: complete ? data : null };
}

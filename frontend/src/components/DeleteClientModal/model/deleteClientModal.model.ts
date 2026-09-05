import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const CLIENT_DELETE_FRAGMENT = graphql(`
  fragment ClientDeleteFields on User {
    id
    name
  }
`);

export const DELETE_CLIENT_MUTATION = graphql(`
  mutation DeleteClient($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      __typename
      ... on DeleteUserSuccess {
        id
      }
      ... on UserNotFoundError {
        message
      }
    }
  }
`);

export function useDeleteClientModalModel(clientId: string | null) {
  const { data, complete } = useFragment({
    fragment: CLIENT_DELETE_FRAGMENT,
    fragmentName: 'ClientDeleteFields',
    from: clientId ? { __typename: 'User' as const, id: clientId } : null,
  });

  const [deleteClient, { loading }] = useMutation(DELETE_CLIENT_MUTATION, {
    update(cache, { data: result }) {
      if (result?.deleteUser.__typename !== 'DeleteUserSuccess') {
        return;
      }

      // Keyed off the id the server returned, not the one the component holds.
      const cacheId = cache.identify({ __typename: 'User', id: result.deleteUser.id });
      if (!cacheId) {
        return;
      }
      cache.evict({ id: cacheId });
      cache.gc();
    },
  });

  return { client: complete ? data : null, deleteClient, isDeleting: loading };
}

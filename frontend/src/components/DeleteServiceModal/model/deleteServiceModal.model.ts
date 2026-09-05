import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const SERVICE_DELETE_FRAGMENT = graphql(`
  fragment ServiceDeleteFields on Service {
    id
    name
  }
`);

export const DELETE_SERVICE_MUTATION = graphql(`
  mutation DeleteService($input: DeleteServiceInput!) {
    deleteService(input: $input) {
      __typename
      ... on DeleteServiceSuccess {
        id
      }
      ... on ServiceNotFoundError {
        message
      }
    }
  }
`);

export function useDeleteServiceModalModel(serviceId: string | null) {
  const { data, complete } = useFragment({
    fragment: SERVICE_DELETE_FRAGMENT,
    fragmentName: 'ServiceDeleteFields',
    from: serviceId ? { __typename: 'Service' as const, id: serviceId } : null,
  });

  const [deleteService, { loading }] = useMutation(DELETE_SERVICE_MUTATION, {
    update(cache, { data: result }) {
      if (result?.deleteService.__typename !== 'DeleteServiceSuccess') {
        return;
      }

      // Keyed off the id the server returned, not the one the component holds.
      const cacheId = cache.identify({ __typename: 'Service', id: result.deleteService.id });
      if (!cacheId) {
        return;
      }
      cache.evict({ id: cacheId });
      cache.gc();
    },
  });

  return { service: complete ? data : null, deleteService, isDeleting: loading };
}

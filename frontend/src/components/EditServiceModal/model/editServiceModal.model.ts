import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const SERVICE_EDIT_FRAGMENT = graphql(`
  fragment ServiceEditFields on Service {
    id
    name
    price
    durationMinutes
  }
`);

export const UPDATE_SERVICE_MUTATION = graphql(`
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      __typename
      ... on UpdateServiceSuccess {
        service {
          id
          ...ServiceCardFields
          ...ServiceEditFields
          ...ServiceDeleteFields
        }
      }
      ... on ServiceAlreadyExistsError {
        message
      }
      ... on ServiceNotFoundError {
        message
      }
    }
  }
`);

export function useEditServiceModalModel(serviceId: string | null) {
  const { data, complete } = useFragment({
    fragment: SERVICE_EDIT_FRAGMENT,
    fragmentName: 'ServiceEditFields',
    from: serviceId ? { __typename: 'Service' as const, id: serviceId } : null,
  });

  const [updateService, { loading }] = useMutation(UPDATE_SERVICE_MUTATION);

  return { service: complete ? data : null, updateService, isSaving: loading };
}

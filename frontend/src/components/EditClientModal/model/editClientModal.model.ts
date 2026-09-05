import { useFragment, useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const CLIENT_EDIT_FRAGMENT = graphql(`
  fragment ClientEditFields on User {
    id
    name
    email
    phoneNumber
  }
`);

export const UPDATE_CLIENT_MUTATION = graphql(`
  mutation UpdateClient($input: UpdateUserInput!) {
    updateUser(input: $input) {
      __typename
      ... on UpdateUserSuccess {
        user {
          id
          ...ClientRowFields
          ...ClientEditFields
          ...ClientDeleteFields
        }
      }
      ... on UserAlreadyExistsError {
        message
      }
      ... on UserNotFoundError {
        message
      }
    }
  }
`);

export function useEditClientModalModel(clientId: string | null) {
  const { data, complete } = useFragment({
    fragment: CLIENT_EDIT_FRAGMENT,
    fragmentName: 'ClientEditFields',
    from: clientId ? { __typename: 'User' as const, id: clientId } : null,
  });

  const [updateClient, { loading }] = useMutation(UPDATE_CLIENT_MUTATION);

  return { client: complete ? data : null, updateClient, isSaving: loading };
}

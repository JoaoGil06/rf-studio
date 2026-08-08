import { useMutation } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      __typename
      ... on LoginSuccess {
        token
        user {
          id
          name
          email
          role {
            name
          }
        }
      }
      ... on InvalidCredentialsError {
        message
      }
    }
  }
`);

export function useLoginModel() {
  const [login] = useMutation(LOGIN_MUTATION);
  return { login };
}

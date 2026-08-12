import { CombinedGraphQLErrors } from '@apollo/client';

export function isBadUserInput(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((graphQLError) => graphQLError.extensions?.code === 'BAD_USER_INPUT')
  );
}

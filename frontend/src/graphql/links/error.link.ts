import { CombinedGraphQLErrors, ServerError } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';

/**
 * Transport-level observation only. Mapping error codes to user-facing pt-PT
 * copy is the ViewModel's job (architecture/SKILL.md) — never the View's, and
 * not this link's.
 *
 * Apollo Client 4 collapsed `graphQLErrors` / `networkError` / `protocolErrors`
 * into a single `error` property discriminated with `ErrorClass.is()`. Do not
 * rewrite this as a v3 `onError({ graphQLErrors, networkError })` callback.
 */
export const errorLink = new ErrorLink(({ error, operation }) => {
  const name = operation.operationName;

  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL] ${name}: ${message}`, extensions?.code);
    });
    return;
  }

  if (ServerError.is(error)) {
    console.error(`[Network] ${name}: ${error.message}`);
    return;
  }

  if (error) {
    console.error(`[Error] ${name}: ${error.message}`);
  }
});

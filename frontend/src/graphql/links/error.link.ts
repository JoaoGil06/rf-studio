import { CombinedGraphQLErrors, ServerError } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { authStorage } from '../../lib/adapters/auth-storage/auth-storage.adapter';

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

    // `requireAuthPlugin` throws a GraphQLError during `didResolveOperation`, so a
    // rejected token arrives as a 200 with an `errors` array — not an HTTP 401.
    // Checking `ServerError.is(error) && statusCode === 401` would never fire here.
    // The link only discards the stale record; it lives outside the router and
    // cannot navigate. AuthProvider observes the cleared session and ProtectedRoute
    // performs the redirect.
    if (error.errors.some((graphQLError) => graphQLError.extensions?.code === 'UNAUTHENTICATED')) {
      authStorage.clear();
    }
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

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { errorLink } from './links/error.link';
import { httpLink } from './links/http.link';

/**
 * Every list in this app follows the Relay Connection spec (architecture/SKILL.md),
 * so each connection field needs a `relayStylePagination` policy — without it
 * `fetchMore` replaces pages instead of appending them. `users` is the only
 * connection wired today; add siblings as their features land.
 */
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: relayStylePagination(),
      },
    },
  },
});

// Order is load-bearing: errorLink outermost so it observes every response, and
// httpLink last. The auth link is inserted between them in login-view-plan.md.
export const client = new ApolloClient({
  cache,
  link: ApolloLink.from([errorLink, httpLink]),
});

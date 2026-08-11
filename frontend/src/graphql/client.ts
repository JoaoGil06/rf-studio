import { ApolloClient, ApolloLink } from '@apollo/client';
import { cache } from './cache';
import { authLink } from './links/auth.link';
import { errorLink } from './links/error.link';
import { httpLink } from './links/http.link';

export const client = new ApolloClient({
  cache,
  link: ApolloLink.from([errorLink, authLink, httpLink]),
});

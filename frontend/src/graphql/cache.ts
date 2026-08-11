import { InMemoryCache, type TypePolicies } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      users: relayStylePagination(),
      products: relayStylePagination(['category']),
    },
  },
};

export const createCache = () => new InMemoryCache({ typePolicies });

export const cache = createCache();

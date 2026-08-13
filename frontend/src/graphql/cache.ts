import { InMemoryCache, type TypePolicies } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      users: relayStylePagination(),
      products: relayStylePagination(['category']),
      // The key argument is what keeps the two tabs' lists apart: without it,
      // switching tabs would concatenate eyebrow services onto the nails list.
      services: relayStylePagination(['category']),
    },
  },
};

export const createCache = () => new InMemoryCache({ typePolicies });

export const cache = createCache();

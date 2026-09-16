import { InMemoryCache, type TypePolicies } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      /**
       * `role` keeps a managers list from concatenating onto the clients list.
       * `first` keeps two *different reads of the same list* apart: Clientes
       * browses 25 at a time, the Agenda's booking picker takes one page of
       * `PICKER_PAGE_SIZE`. Without it they share a bucket, and
       * `relayStylePagination` overwrites from index 0 whenever the incoming
       * read carries no `after` — so a Clientes visit would silently truncate
       * the picker and a client past the 25th would become unbookable.
       *
       * Safe only because every read of this field passes a constant page size:
       * `fetchMore` on Clientes repeats `CLIENTS_PAGE_SIZE`, so its pages still
       * merge with each other. A future read with a varying `first` would
       * fragment itself, and should take a `@connection` key instead.
       */
      users: relayStylePagination(['role', 'first']),
      products: relayStylePagination(['category']),
      // The key argument is what keeps the two tabs' lists apart: without it,
      // switching tabs would concatenate eyebrow services onto the nails list.
      // The booking picker passes no category at all, so it is already a
      // bucket of its own and needs nothing here.
      services: relayStylePagination(['category']),
    },
  },
};

export const createCache = () => new InMemoryCache({ typePolicies });

export const cache = createCache();

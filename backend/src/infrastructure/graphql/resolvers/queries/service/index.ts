import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as serviceQuery } from './service.query.js';
import { resolvers as servicesQuery } from './services.query.js';

export const serviceQueryResolvers = mergeResolvers([serviceQuery, servicesQuery]);

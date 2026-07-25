import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as productQuery } from './product.query.js';
import { resolvers as productsQuery } from './products.query.js';

export const productQueryResolvers = mergeResolvers([productQuery, productsQuery]);

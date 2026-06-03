import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerProduct } from './registerProduct.mutation.js';

export const productMutationResolvers = mergeResolvers([registerProduct]);
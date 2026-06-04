import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerProduct } from './registerProduct.mutation.js';
import { resolvers as updateProduct } from './updateProduct.mutation.js';

export const productMutationResolvers = mergeResolvers([registerProduct, updateProduct]);
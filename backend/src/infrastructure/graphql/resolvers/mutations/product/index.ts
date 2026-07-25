import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerProduct } from './registerProduct.mutation.js';
import { resolvers as updateProduct } from './updateProduct.mutation.js';
import { resolvers as deleteProduct } from './deleteProduct.mutation.js';

export const productMutationResolvers = mergeResolvers([
  registerProduct,
  updateProduct,
  deleteProduct,
]);
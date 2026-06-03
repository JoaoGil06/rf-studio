import { mergeResolvers } from '@graphql-tools/merge';
import { userMutationResolvers } from './user/index.js';
import { authMutationResolvers } from './auth/index.js';
import { serviceMutationResolvers } from './service/index.js';
import { scheduleMutationResolvers } from './schedule/index.js';
import { productMutationResolvers } from './product/index.js';

export const mutationResolvers = mergeResolvers([
  userMutationResolvers,
  authMutationResolvers,
  serviceMutationResolvers,
  scheduleMutationResolvers,
  productMutationResolvers,
]);

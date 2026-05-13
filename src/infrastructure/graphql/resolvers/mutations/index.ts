import { mergeResolvers } from '@graphql-tools/merge';
import { userMutationResolvers } from './user/index.js';
import { authMutationResolvers } from './auth/index.js';
import { serviceMutationResolvers } from './service/index.js';

export const mutationResolvers = mergeResolvers([
  userMutationResolvers,
  authMutationResolvers,
  serviceMutationResolvers,
]);

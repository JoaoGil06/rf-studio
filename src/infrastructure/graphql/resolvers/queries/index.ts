import { mergeResolvers } from '@graphql-tools/merge';
import { userQueryResolvers } from './user/index.js';

export const queryResolvers = mergeResolvers([userQueryResolvers]);

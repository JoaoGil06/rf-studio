import { mergeResolvers } from '@graphql-tools/merge';
import { userQueryResolvers } from './user/index.js';
import { serviceQueryResolvers } from './service/index.js';
import { scheduleQueryResolvers } from './schedule/index.js';

export const queryResolvers = mergeResolvers([
  userQueryResolvers,
  serviceQueryResolvers,
  scheduleQueryResolvers,
]);

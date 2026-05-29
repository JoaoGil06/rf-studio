import { mergeResolvers } from '@graphql-tools/merge';
import { userTypeResolvers } from './user/index.js';
import { scheduleTypeResolvers } from './schedule/index.js';

export const fieldResolvers = mergeResolvers([userTypeResolvers, scheduleTypeResolvers]);

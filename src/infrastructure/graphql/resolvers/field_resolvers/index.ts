import { mergeResolvers } from '@graphql-tools/merge';
import { userTypeResolvers } from './user/index.js';

export const fieldResolvers = mergeResolvers([userTypeResolvers]);

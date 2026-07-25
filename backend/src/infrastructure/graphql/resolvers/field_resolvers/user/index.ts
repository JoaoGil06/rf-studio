import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';
import { resolvers as userFields } from './user.fields.js';

export const userTypeResolvers: IResolvers = mergeResolvers([userFields]);

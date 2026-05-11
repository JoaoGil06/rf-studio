import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as usersQuery } from './users.query.js';
import { resolvers as userQuery } from './user.query.js';

export const userQueryResolvers = mergeResolvers([usersQuery, userQuery]);

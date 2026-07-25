import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as login } from './login.mutation.js';
import { resolvers as logout } from './logout.mutation.js';

export const authMutationResolvers = mergeResolvers([login, logout]);

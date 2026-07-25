import { mergeResolvers } from '@graphql-tools/merge';
import { resolvers as registerUser } from './registerUser.mutation.js';
import { resolvers as updateUser } from './updateUser.mutation.js';
import { resolvers as deleteUser } from './deleteUser.mutation.js';

export const userMutationResolvers = mergeResolvers([registerUser, updateUser, deleteUser]);

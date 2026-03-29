import { userMutations } from './mutations/user.mutation.js';

export const resolvers = {
  ...userMutations,
};

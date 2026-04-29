import { userMutations } from './mutations/user.mutation.js';
import { userQueries } from './queries/user.queries.js';

export const resolvers = {
  ...userQueries,
  ...userMutations,
};

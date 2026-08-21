import type { AppContext } from '../../../context.types.js';

export interface GetUsersArgs {
  first?: number | null;
  after?: string | null;
  role?: string | null;
}

export const resolvers = {
  Query: {
    users: async (_: unknown, args: GetUsersArgs, context: AppContext) => {
      return context.useCases.getUsers.execute(args);
    },
  },
};

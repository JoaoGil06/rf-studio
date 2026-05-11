import type { AppContext } from '../../../context.types.js';

export interface GetUserArgs {
  id: string;
}

export const resolvers = {
  Query: {
    user: async (_: unknown, args: GetUserArgs, context: AppContext) => {
      return context.useCases.getUser.execute(args);
    },
  },
};

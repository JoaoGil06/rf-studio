import type { AppContext } from '../../../context.types.js';

export const resolvers = {
  Mutation: {
    logout: async (_: unknown, __: unknown, context: AppContext) => {
      return context.useCases.logout.execute();
    },
  },
};

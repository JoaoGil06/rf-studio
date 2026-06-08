import { GraphQLError } from 'graphql';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetSchedulesArgs {
  filter?: { userId?: string | null; status?: string | null } | null;
  first?: number | null;
  after?: string | null;
}

export const resolvers = {
  Query: {
    schedules: async (_: unknown, args: GetSchedulesArgs, context: AppContext) => {
      try {
        return await context.useCases.getSchedules.execute(args);
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

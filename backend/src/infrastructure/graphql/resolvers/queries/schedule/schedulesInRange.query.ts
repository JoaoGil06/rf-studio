import { GraphQLError } from 'graphql';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetSchedulesInRangeArgs {
  filter: {
    userId?: string | null;
    year?: number | null;
    month?: number | null;
    weekStart?: string | null;
    status?: string | null;
  };
}

export const resolvers = {
  Query: {
    schedulesInRange: async (_: unknown, args: GetSchedulesInRangeArgs, context: AppContext) => {
      try {
        return await context.useCases.getSchedulesInRange.execute({
          filter: {
            userId: args.filter.userId,
            year: args.filter.year,
            month: args.filter.month,
            weekStart: args.filter.weekStart ? new Date(args.filter.weekStart) : null,
            status: args.filter.status,
          },
        });
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

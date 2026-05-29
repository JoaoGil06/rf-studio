import { GraphQLError } from 'graphql';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetScheduleArgs {
  id: string;
}

export const resolvers = {
  Query: {
    schedule: async (_: unknown, args: GetScheduleArgs, context: AppContext) => {
      try {
        return await context.useCases.getSchedule.execute(args);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new GraphQLError(error.message, { extensions: { code: 'NOT_FOUND' } });
        }
        throw error;
      }
    },
  },
};

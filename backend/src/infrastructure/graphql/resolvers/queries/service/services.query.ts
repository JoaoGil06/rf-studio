import { GraphQLError } from 'graphql';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetServicesArgs {
  first?: number | null;
  after?: string | null;
  category?: string | null;
}

export const resolvers = {
  Query: {
    services: async (_: unknown, args: GetServicesArgs, context: AppContext) => {
      try {
        return await context.useCases.getServices.execute(args);
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

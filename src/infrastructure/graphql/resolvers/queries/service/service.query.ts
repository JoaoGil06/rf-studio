import { GraphQLError } from 'graphql';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetServiceArgs {
  id: string;
}

export const resolvers = {
  Query: {
    service: async (_: unknown, args: GetServiceArgs, context: AppContext) => {
      try {
        return await context.useCases.getService.execute(args);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new GraphQLError(error.message, { extensions: { code: 'NOT_FOUND' } });
        }
        throw error;
      }
    },
  },
};

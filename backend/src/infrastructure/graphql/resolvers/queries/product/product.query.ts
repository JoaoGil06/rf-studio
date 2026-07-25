import { GraphQLError } from 'graphql';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetProductArgs {
  id: string;
}

export const resolvers = {
  Query: {
    product: async (_: unknown, args: GetProductArgs, context: AppContext) => {
      try {
        return await context.useCases.getProduct.execute(args);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          throw new GraphQLError(error.message, { extensions: { code: 'NOT_FOUND' } });
        }
        throw error;
      }
    },
  },
};

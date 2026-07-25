import { GraphQLError } from 'graphql';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface GetProductsArgs {
  first?: number | null;
  after?: string | null;
}

export const resolvers = {
  Query: {
    products: async (_: unknown, args: GetProductsArgs, context: AppContext) => {
      try {
        return await context.useCases.getProducts.execute(args);
      } catch (error) {
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

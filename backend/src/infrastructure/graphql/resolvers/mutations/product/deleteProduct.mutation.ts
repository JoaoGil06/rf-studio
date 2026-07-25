import { GraphQLError } from 'graphql';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface DeleteProductArgs {
  input: {
    id: string;
  };
}

export const resolvers = {
  DeleteProductPayload: {
    __resolveType(obj: { id?: unknown; message?: unknown }) {
      if ('id' in obj) return 'DeleteProductSuccess';
      return 'ProductNotFoundError';
    },
  },
  Mutation: {
    deleteProduct: async (_: unknown, { input }: DeleteProductArgs, context: AppContext) => {
      try {
        return await context.useCases.deleteProduct.execute(input);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

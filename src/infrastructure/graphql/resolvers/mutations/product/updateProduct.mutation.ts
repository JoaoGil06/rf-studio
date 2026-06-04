import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import type { AppContext } from '../../../context.types.js';

export interface UpdateProductArgs {
  input: {
    id: string;
    name?: string | null;
    brand?: string | null;
    color?: string | null;
    isAvailable?: boolean;
  };
}

export const resolvers = {
  UpdateProductPayload: {
    __resolveType(obj: { __kind?: string; product?: unknown }) {
      if ('product' in obj) return 'UpdateProductSuccess';
      if (obj.__kind === 'ProductNotFoundError') return 'ProductNotFoundError';
      return 'ProductAlreadyExistsError';
    },
  },
  Mutation: {
    updateProduct: async (_: unknown, { input }: UpdateProductArgs, context: AppContext) => {
      try {
        const product = await context.useCases.updateProduct.execute(input);
        return { product };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: 'ProductNotFoundError', message: error.message };
        }
        if (error instanceof ConflictError) {
          return { __kind: 'ProductAlreadyExistsError', message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

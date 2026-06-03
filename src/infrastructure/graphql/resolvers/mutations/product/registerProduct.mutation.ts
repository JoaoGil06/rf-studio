import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface RegisterProductArgs {
  input: {
    name: string;
    brand: string;
    color?: string | null;
    isAvailable?: boolean;
  };
}

export const resolvers = {
  RegisterProductPayload: {
    __resolveType(obj: { product?: unknown; message?: unknown }) {
      if ('product' in obj) return 'RegisterProductSuccess';
      return 'ProductAlreadyExistsError';
    },
  },
  Mutation: {
    registerProduct: async (_: unknown, { input }: RegisterProductArgs, context: AppContext) => {
      try {
        const product = await context.useCases.registerProduct.execute(input);
        return { product };
      } catch (error) {
        if (error instanceof ConflictError) {
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
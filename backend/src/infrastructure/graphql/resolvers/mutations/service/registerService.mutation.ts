import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface RegisterServiceArgs {
  input: {
    name: string;
    category: 'nails' | 'eyebrows';
    price: number;
    durationMinutes: number;
  };
}

export const resolvers = {
  RegisterServicePayload: {
    __resolveType(obj: { service?: unknown; message?: unknown }) {
      if ('service' in obj) return 'RegisterServiceSuccess';
      return 'ServiceAlreadyExistsError';
    },
  },
  Mutation: {
    registerService: async (_: unknown, { input }: RegisterServiceArgs, context: AppContext) => {
      try {
        const service = await context.useCases.registerService.execute(input);
        return { service };
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

import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';

export interface UpdateServiceArgs {
  input: {
    id: string;
    name: string;
    category: 'nails' | 'eyebrows';
    price: number;
    durationMinutes: number;
  };
}

export const resolvers = {
  UpdateServicePayload: {
    __resolveType(obj: { __kind?: string; service?: unknown }) {
      if ('service' in obj) return 'UpdateServiceSuccess';
      if (obj.__kind === 'ServiceNotFoundError') return 'ServiceNotFoundError';
      return 'ServiceAlreadyExistsError';
    },
  },
  Mutation: {
    updateService: async (_: unknown, { input }: UpdateServiceArgs, context: AppContext) => {
      try {
        const service = await context.useCases.updateService.execute(input);
        return { service };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: 'ServiceNotFoundError', message: error.message };
        }
        if (error instanceof ConflictError) {
          return { __kind: 'ServiceAlreadyExistsError', message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

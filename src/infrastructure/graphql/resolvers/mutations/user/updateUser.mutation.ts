import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import type { AppContext } from '../../../context.types.js';

export interface UpdateUserArgs {
  input: {
    id: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    birthDate?: string | null;
  };
}

export const resolvers = {
  UpdateUserPayload: {
    __resolveType(obj: { __kind?: string; user?: unknown }) {
      if ('user' in obj) return 'UpdateUserSuccess';
      if (obj.__kind === 'UserNotFoundError') return 'UserNotFoundError';
      return 'UserAlreadyExistsError';
    },
  },
  Mutation: {
    updateUser: async (_: unknown, { input }: UpdateUserArgs, context: AppContext) => {
      try {
        const user = await context.useCases.updateUser.execute(input);
        return { user };
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: 'UserNotFoundError', message: error.message };
        }
        if (error instanceof ConflictError) {
          return { __kind: 'UserAlreadyExistsError', message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

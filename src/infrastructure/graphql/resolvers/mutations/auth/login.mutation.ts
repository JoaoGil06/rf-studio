import { GraphQLError } from 'graphql';
import { InvalidValueError } from '../../../../../domain/@shared/errors/invalidValueError.js';
import { UnathorizedError } from '../../../../../domain/@shared/errors/unathorizedError.js';
import type { AppContext } from '../../../context.types.js';

export interface LoginArgs {
  input: {
    email: string;
    password: string;
  };
}

export const resolvers = {
  LoginPayload: {
    __resolveType(obj: { token?: unknown; message?: unknown }) {
      if ('token' in obj) return 'LoginSuccess';
      return 'InvalidCredentialsError';
    },
  },
  Mutation: {
    login: async (_: unknown, { input }: LoginArgs, context: AppContext) => {
      try {
        return await context.useCases.login.execute(input);
      } catch (error) {
        if (error instanceof UnathorizedError) {
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

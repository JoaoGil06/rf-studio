import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../domain/@shared/errors/invalidValueError.js';
import { AppContext } from '../../context.js';
import { UnathorizedError } from '../../../../domain/@shared/errors/unathorizedError.js';

export interface RegisterUserArgs {
  input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    birthDate?: string | null;
  };
}

export interface LoginArgs {
  input: {
    email: string;
    password: string;
  };
}

export const userMutations = {
  RegisterUserPayload: {
    __resolveType(obj: { user?: unknown; message?: unknown }) {
      if ('user' in obj) return 'RegisterUserSuccess';
      return 'UserAlreadyExistsError';
    },
  },
  LoginPayload: {
    __resolveType(obj: { token?: unknown; message?: unknown }) {
      if ('token' in obj) return 'LoginSuccess';
      return 'InvalidCredentialsError';
    },
  },
  Mutation: {
    registerUser: async (_: unknown, { input }: RegisterUserArgs, context: AppContext) => {
      try {
        const user = await context.useCases.registerUser.execute(input);

        return { user };
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
    login: async (_: unknown, { input }: LoginArgs, context: AppContext) => {
      try {
        const result = await context.useCases.login.execute(input);

        return result;
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
    logout: async (_: unknown, __: unknown, context: AppContext) => {
      const token = context.token;
      try {
        return await context.useCases.logout.execute(token);
      } catch (error) {
        if (error instanceof UnathorizedError) {
          throw new GraphQLError(error.message, { extensions: { code: 'UNAUTHENTICATED' } });
        }
        throw error;
      }
    },
  },
};

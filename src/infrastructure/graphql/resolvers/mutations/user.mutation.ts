import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../domain/@shared/errors/invalidValueError.js';
import { AppContext } from '../../context.types.js';
import { UnathorizedError } from '../../../../domain/@shared/errors/unathorizedError.js';
import { EntityNotFoundError } from '../../../../domain/@shared/errors/entityNotFoundError.js';

export interface RegisterUserArgs {
  input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    birthDate?: string | null;
  };
}

export interface UpdateUserArgs {
  input: {
    id: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    birthDate?: string | null;
  };
}

export interface DeleteUserArgs {
  input: {
    id: string;
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
  UpdateUserPayload: {
    __resolveType(obj: { __kind?: string; user?: unknown }) {
      if ('user' in obj) return 'UpdateUserSuccess';
      if (obj.__kind === 'UserNotFoundError') return 'UserNotFoundError';
      return 'UserAlreadyExistsError';
    },
  },
  DeleteUserPayload: {
    __resolveType(obj: { __kind?: string; message?: unknown }) {
      if ('id' in obj) return 'DeleteUserSuccess';
      return 'UserNotFoundError';
    },
  },
  Mutation: {
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
      return await context.useCases.logout.execute();
    },
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
    deleteUser: async (_: unknown, { input }: DeleteUserArgs, context: AppContext) => {
      try {
        return await context.useCases.deleteUser.execute(input);
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          return { __kind: 'UserNotFoundError', message: error.message };
        }
        if (error instanceof InvalidValueError) {
          throw new GraphQLError(error.message, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw error;
      }
    },
  },
};

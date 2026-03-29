import { GraphQLError } from 'graphql';
import { ConflictError } from '../../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../../domain/@shared/errors/invalidValueError.js';
import { AppContext } from '../../context.js';

export interface RegisterUserArgs {
  input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    birthDate?: string | null;
  };
}

export const userMutations = {
  RegisterUserPayload: {
    __resolveType(obj: { user?: unknown; message?: unknown }) {
      if ('user' in obj) return 'RegisterUserSuccess';
      return 'UserAlreadyExistsError';
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
  },
};

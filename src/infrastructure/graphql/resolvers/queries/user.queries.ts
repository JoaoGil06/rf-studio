import { UserNodeDto } from '../../../../usecase/users/get-users/get-users.dto.js';
import type { AppContext } from '../../context.types.js';

export interface GetUsersArgs {
  first?: number | null;
  after?: string | null;
}

export interface GetUserArgs {
  id: string;
}

export const userQueries = {
  Query: {
    users: async (_: unknown, args: GetUsersArgs, context: AppContext) => {
      const users = await context.useCases.getUsers.execute(args);

      return users;
    },
    user: async (_: unknown, args: GetUserArgs, context: AppContext) => {
      const user = await context.useCases.getUser.execute(args);

      return user;
    },
  },
  User: {
    role: async (parent: UserNodeDto, _: unknown, context: AppContext) => {
      const role = await context.dataLoaders.role.load(parent.roleId);

      return role;
    },
  },
};

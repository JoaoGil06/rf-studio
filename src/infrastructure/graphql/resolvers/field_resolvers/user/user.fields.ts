import type { UserNodeDto } from '../../../../../usecase/users/get-users/get-users.dto.js';
import type { AppContext } from '../../../context.types.js';

export const resolvers = {
  User: {
    role: async (parent: UserNodeDto, _: unknown, context: AppContext) => {
      return context.dataLoaders.role.load(parent.roleId);
    },
  },
};

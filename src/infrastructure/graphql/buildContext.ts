import type { Request } from 'express';
import type { AppContext } from './context.js';
import type { RegisterUserUseCase } from '../../usecase/users/register-user/register-user.usecase.js';
import { GetUsersUseCase } from '../../usecase/users/get-users/get-users.usecase.js';
import DataLoader from 'dataloader';
import { RoleDto } from './dataloaders/role/role.dataloader.dto.js';
import { GetUserUseCase } from '../../usecase/users/get-user/get-user.usecase.js';

interface AppUseCases {
  registerUser: RegisterUserUseCase;
  getUsers: GetUsersUseCase;
  getUser: GetUserUseCase;
}

interface AppDataLoaders {
  role: DataLoader<string, RoleDto | null>;
}

export function buildContext(useCases: AppUseCases, dataLoaders: AppDataLoaders) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async ({ req }: { req: Request }): Promise<AppContext> => ({
    useCases,
    dataLoaders,
  });
}

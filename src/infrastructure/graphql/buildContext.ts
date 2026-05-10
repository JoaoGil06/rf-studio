import type { Request } from 'express';
import type { AppContext } from './context.js';
import type { RegisterUserUseCase } from '../../usecase/users/register-user/register-user.usecase.js';
import { GetUsersUseCase } from '../../usecase/users/get-users/get-users.usecase.js';
import DataLoader from 'dataloader';
import { RoleDto } from './dataloaders/role/role.dataloader.dto.js';
import { GetUserUseCase } from '../../usecase/users/get-user/get-user.usecase.js';
import { LoginUseCase } from '../../usecase/auth/login/login.usecase.js';
import { extractBearerToken } from './helpers/extract-berarer-token.js';
import { LogoutUseCase } from '../../usecase/auth/logout/logout.usecase.js';
import { JwtPayload } from 'jsonwebtoken';
import { IJwtAdapter } from '../../usecase/interfaces/jwt-adapter.interface.js';
import { UpdateUserUseCase } from '../../usecase/users/update-user/update-user.usecase.js';

interface AppUseCases {
  login: LoginUseCase;
  logout: LogoutUseCase;
  registerUser: RegisterUserUseCase;
  getUsers: GetUsersUseCase;
  getUser: GetUserUseCase;
  updateUser: UpdateUserUseCase;
}

interface AppDataLoaders {
  role: DataLoader<string, RoleDto | null>;
}

export function buildContext(
  useCases: AppUseCases,
  dataLoaders: AppDataLoaders,
  jwtAdapter: IJwtAdapter,
) {
  return async ({ req }: { req: Request }): Promise<AppContext> => {
    const token = extractBearerToken(req.headers.authorization);

    let currentUser: JwtPayload | null = null;

    if (token) {
      try {
        currentUser = jwtAdapter.verify(token);
      } catch {
        currentUser = null;
      }
    }

    return {
      currentUser,
      useCases,
      dataLoaders,
    };
  };
}

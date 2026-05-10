import DataLoader from 'dataloader';
import { RoleDto } from './dataloaders/role/role.dataloader.dto.js';
import { RegisterUserUseCase } from '../../usecase/users/register-user/register-user.usecase.js';
import { GetUsersUseCase } from '../../usecase/users/get-users/get-users.usecase.js';
import { GetUserUseCase } from '../../usecase/users/get-user/get-user.usecase.js';
import { LoginUseCase } from '../../usecase/auth/login/login.usecase.js';
import { LogoutUseCase } from '../../usecase/auth/logout/logout.usecase.js';

export interface AppContext {
  token: string | null;
  useCases: {
    login: LoginUseCase;
    logout: LogoutUseCase;
    registerUser: RegisterUserUseCase;
    getUsers: GetUsersUseCase;
    getUser: GetUserUseCase;
  };
  dataLoaders: {
    role: DataLoader<string, RoleDto | null>;
  };
}

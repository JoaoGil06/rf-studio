import DataLoader from 'dataloader';
import { RoleDto } from './dataloaders/role/role.dataloader.dto.js';
import { RegisterUserUseCase } from '../../usecase/users/register-user/register-user.usecase.js';
import { GetUsersUseCase } from '../../usecase/users/get-users/get-users.usecase.js';
import { GetUserUseCase } from '../../usecase/users/get-user/get-user.usecase.js';
import { LoginUseCase } from '../../usecase/auth/login/login.usecase.js';
import { LogoutUseCase } from '../../usecase/auth/logout/logout.usecase.js';
import { JwtPayload } from 'jsonwebtoken';
import { UpdateUserUseCase } from '../../usecase/users/update-user/update-user.usecase.js';
import { DeleteUserUseCase } from '../../usecase/users/delete-user/delete-user.usecase.js';
import { RegisterServiceUseCase } from '../../usecase/services/register-service/register-service.usecase.js';
import { GetServiceUseCase } from '../../usecase/services/get-service/get-service.usecase.js';
import { GetServicesUseCase } from '../../usecase/services/get-services/get-services.usecase.js';

export interface AppContext {
  currentUser: JwtPayload | null;
  useCases: {
    login: LoginUseCase;
    logout: LogoutUseCase;
    registerUser: RegisterUserUseCase;
    getUsers: GetUsersUseCase;
    getUser: GetUserUseCase;
    updateUser: UpdateUserUseCase;
    deleteUser: DeleteUserUseCase;
    registerService: RegisterServiceUseCase;
    getService: GetServiceUseCase;
    getServices: GetServicesUseCase;
  };
  dataLoaders: {
    role: DataLoader<string, RoleDto | null>;
  };
}

export interface AppUseCases {
  login: LoginUseCase;
  logout: LogoutUseCase;
  registerUser: RegisterUserUseCase;
  getUsers: GetUsersUseCase;
  getUser: GetUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
  registerService: RegisterServiceUseCase;
  getService: GetServiceUseCase;
  getServices: GetServicesUseCase;
}

export interface AppDataLoaders {
  role: DataLoader<string, RoleDto | null>;
}

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
import { UpdateServiceUseCase } from '../../usecase/services/update-service/update-service.usecase.js';
import { DeleteServiceUseCase } from '../../usecase/services/delete-service/delete-service.usecase.js';
import { RegisterScheduleUseCase } from '../../usecase/schedule/register-schedule/register-schedule.usecase.js';
import { GetScheduleUseCase } from '../../usecase/schedule/get-schedule/get-schedule.usecase.js';
import { GetSchedulesUseCase } from '../../usecase/schedule/get-schedules/get-schedules.usecase.js';
import { GetSchedulesInRangeUseCase } from '../../usecase/schedule/get-schedules-in-range/get-schedules-in-range.usecase.js';
import { UserDataLoaderDto } from './dataloaders/user/user.dataloader.dto.js';
import { ServiceDataLoaderDto } from './dataloaders/service/service.dataloader.dto.js';
import { UpdateScheduleUseCase } from '../../usecase/schedule/update-schedule/update-schedule.usecase.js';
import { DeleteScheduleUseCase } from '../../usecase/schedule/delete-schedule/delete-schedule.usecase.js';
import { UploadPhotoUseCase } from '../../usecase/schedule/upload-photo/upload-photo.usecase.js';
import { RegisterProductUseCase } from '../../usecase/products/register-product/register-product.usecase.js';
import { GetProductUseCase } from '../../usecase/products/get-product/get-product.usecase.js';
import { GetProductsUseCase } from '../../usecase/products/get-products/get-products.usecase.js';

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
    updateService: UpdateServiceUseCase;
    deleteService: DeleteServiceUseCase;
    registerSchedule: RegisterScheduleUseCase;
    getSchedule: GetScheduleUseCase;
    getSchedules: GetSchedulesUseCase;
    getSchedulesInRange: GetSchedulesInRangeUseCase;
    updateSchedule: UpdateScheduleUseCase;
    deleteSchedule: DeleteScheduleUseCase;
    uploadPhoto: UploadPhotoUseCase;
    registerProduct: RegisterProductUseCase;
    getProduct: GetProductUseCase;
    getProducts: GetProductsUseCase;
  };
  dataLoaders: {
    role: DataLoader<string, RoleDto | null>;
    user: DataLoader<string, UserDataLoaderDto | null>;
    service: DataLoader<string, ServiceDataLoaderDto | null>;
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
  updateService: UpdateServiceUseCase;
  deleteService: DeleteServiceUseCase;
  registerSchedule: RegisterScheduleUseCase;
  getSchedule: GetScheduleUseCase;
  getSchedules: GetSchedulesUseCase;
  getSchedulesInRange: GetSchedulesInRangeUseCase;
  updateSchedule: UpdateScheduleUseCase;
  deleteSchedule: DeleteScheduleUseCase;
  uploadPhoto: UploadPhotoUseCase;
  registerProduct: RegisterProductUseCase;
  getProduct: GetProductUseCase;
  getProducts: GetProductsUseCase;
}

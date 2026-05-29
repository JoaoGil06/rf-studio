import { Pool } from 'pg';
import { DATABASE_URL, JWT_SECRET } from './constants/env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UserRepository } from './repository/user.repository.js';
import { BcryptAdapter } from './adapters/bcrypt.adapter.js';
import { ZodAdapter } from './adapters/zod.adapter.js';
import { RegisterUserUseCase } from '../usecase/users/register-user/register-user.usecase.js';
import { GetUsersUseCase } from '../usecase/users/get-users/get-users.usecase.js';
import DataLoader from 'dataloader';
import { RoleDto } from './graphql/dataloaders/role/role.dataloader.dto.js';
import { createRoleDataLoader } from './graphql/dataloaders/role/role.dataloader.js';
import { GetUserUseCase } from '../usecase/users/get-user/get-user.usecase.js';
import { LoginUseCase } from '../usecase/auth/login/login.usecase.js';
import { JwtAdapter } from './adapters/jwt.adapter.js';
import { LogoutUseCase } from '../usecase/auth/logout/logout.usecase.js';
import { UpdateUserUseCase } from '../usecase/users/update-user/update-user.usecase.js';
import { DeleteUserUseCase } from '../usecase/users/delete-user/delete-user.usecase.js';
import { RegisterServiceUseCase } from '../usecase/services/register-service/register-service.usecase.js';
import { ServiceRepository } from './repository/service.repository.js';
import { GetServiceUseCase } from '../usecase/services/get-service/get-service.usecase.js';
import { GetServicesUseCase } from '../usecase/services/get-services/get-services.usecase.js';
import { UpdateServiceUseCase } from '../usecase/services/update-service/update-service.usecase.js';
import { DeleteServiceUseCase } from '../usecase/services/delete-service/delete-service.usecase.js';
import { RegisterScheduleUseCase } from '../usecase/schedule/register-schedule/register-schedule.usecase.js';
import { ScheduleRepository } from './repository/schedule.repository.js';
import { GetScheduleUseCase } from '../usecase/schedule/get-schedule/get-schedule.usecase.js';
import { GetSchedulesUseCase } from '../usecase/schedule/get-schedules/get-schedules.usecase.js';
import { GetSchedulesInRangeUseCase } from '../usecase/schedule/get-schedules-in-range/get-schedules-in-range.usecase.js';
import { UpdateScheduleUseCase } from '../usecase/schedule/update-schedule/update-schedule.usecase.js';

const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);

export const buildRegisterUserUseCase = (): RegisterUserUseCase => {
  const userRepository = new UserRepository(db);
  const hashAdapter = new BcryptAdapter();
  const validationAdapter = new ZodAdapter();

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    hashAdapter,
    validationAdapter,
  );

  return registerUserUseCase;
};

export const buildGetUsersUseCase = (): GetUsersUseCase => {
  const userRepository = new UserRepository(db);

  const getUsersUseCase = new GetUsersUseCase(userRepository);

  return getUsersUseCase;
};

export const buildGetUserUseCase = (): GetUserUseCase => {
  const userRepository = new UserRepository(db);

  const getUserUseCase = new GetUserUseCase(userRepository);

  return getUserUseCase;
};

export const buildRoleDataLoader = (): DataLoader<string, RoleDto | null> => {
  const roleDataLoader = createRoleDataLoader(db);

  return roleDataLoader;
};

export const buildJwtAdapter = (): JwtAdapter => {
  return new JwtAdapter(JWT_SECRET);
};

export const buildLoginUseCase = (): LoginUseCase => {
  const userRepository = new UserRepository(db);
  const hashAdapter = new BcryptAdapter();
  const jwtAdapter = new JwtAdapter(JWT_SECRET);
  const validationAdapter = new ZodAdapter();

  const loginUseCase = new LoginUseCase(userRepository, hashAdapter, jwtAdapter, validationAdapter);

  return loginUseCase;
};

export const buildLogoutUseCase = (): LogoutUseCase => {
  const logoutUseCase = new LogoutUseCase();

  return logoutUseCase;
};

export const buildUpdateUserUseCase = (): UpdateUserUseCase => {
  const userRepository = new UserRepository(db);
  const validationAdapter = new ZodAdapter();

  const updateUserUseCase = new UpdateUserUseCase(userRepository, validationAdapter);

  return updateUserUseCase;
};

export const buildDeleteUserUseCase = (): DeleteUserUseCase => {
  const userRepository = new UserRepository(db);
  const validationAdapter = new ZodAdapter();

  const deleteUserUseCase = new DeleteUserUseCase(userRepository, validationAdapter);

  return deleteUserUseCase;
};

export const buildRegisterServiceUseCase = (): RegisterServiceUseCase => {
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();

  const registerServiceUseCase = new RegisterServiceUseCase(serviceRepository, validationAdapter);

  return registerServiceUseCase;
};

export const buildGetServiceUseCase = (): GetServiceUseCase => {
  const serviceRepository = new ServiceRepository(db);

  const getServiceUseCase = new GetServiceUseCase(serviceRepository);

  return getServiceUseCase;
};

export const buildGetServicesUseCase = (): GetServicesUseCase => {
  const serviceRepository = new ServiceRepository(db);

  const getServicesUseCase = new GetServicesUseCase(serviceRepository);

  return getServicesUseCase;
};

export const buildUpdateServiceUseCase = (): UpdateServiceUseCase => {
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();

  const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository, validationAdapter);

  return updateServiceUseCase;
};

export const buildDeleteServiceUseCase = (): DeleteServiceUseCase => {
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();

  const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository, validationAdapter);

  return deleteServiceUseCase;
};

export const buildRegisterScheduleUseCase = (): RegisterScheduleUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  const userRepository = new UserRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();

  return new RegisterScheduleUseCase(
    scheduleRepository,
    userRepository,
    serviceRepository,
    validationAdapter,
  );
};

export const buildGetScheduleUseCase = (): GetScheduleUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  return new GetScheduleUseCase(scheduleRepository);
};

export const buildGetSchedulesUseCase = (): GetSchedulesUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  return new GetSchedulesUseCase(scheduleRepository);
};

export const buildGetSchedulesInRangeUseCase = (): GetSchedulesInRangeUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  const validationAdapter = new ZodAdapter();
  return new GetSchedulesInRangeUseCase(scheduleRepository, validationAdapter);
};

export const buildUpdateScheduleUseCase = (): UpdateScheduleUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();

  return new UpdateScheduleUseCase(scheduleRepository, serviceRepository, validationAdapter);
};

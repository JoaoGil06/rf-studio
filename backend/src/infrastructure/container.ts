import { Pool } from 'pg';
import {
  DATABASE_URL,
  JWT_SECRET,
  ASSETS_DIR,
  PUBLIC_BASE_URL,
  FEATURE_FLAGS_PATH,
} from './constants/env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UserRepository } from './repository/user.repository.js';
import { BcryptAdapter } from './adapters/bcrypt.adapter.js';
import { ZodAdapter } from './adapters/zod.adapter.js';
import { CryptoPasswordGeneratorAdapter } from './adapters/crypto.adapter.js';
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
import { DeleteScheduleUseCase } from '../usecase/schedule/delete-schedule/delete-schedule.usecase.js';
import { LocalStorageAdapter } from './adapters/local-storage.adapter.js';
import { UploadPhotoUseCase } from '../usecase/schedule/upload-photo/upload-photo.usecase.js';
import { ProductRepository } from './repository/product.repository.js';
import { RegisterProductUseCase } from '../usecase/products/register-product/register-product.usecase.js';
import { GetProductUseCase } from '../usecase/products/get-product/get-product.usecase.js';
import { GetProductsUseCase } from '../usecase/products/get-products/get-products.usecase.js';
import { UpdateProductUseCase } from '../usecase/products/update-product/update-product.usecase.js';
import { DeleteProductUseCase } from '../usecase/products/delete-product/delete-product.usecase.js';
import { CompleteScheduleUseCase } from '../usecase/schedule/complete-schedule/complete-schedule.usecase.js';
import { ScheduleDiscountRepository } from './repository/schedule-discount.repository.js';
import { DiscountService } from '../domain/service/discount/discount.service.js';
import { JsonFileFeatureFlagProvider } from './adapters/feature-flag.adapter.js';

const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);

export const buildRegisterUserUseCase = (): RegisterUserUseCase => {
  const userRepository = new UserRepository(db);
  const hashAdapter = new BcryptAdapter();
  const validationAdapter = new ZodAdapter();
  const passwordGenerator = new CryptoPasswordGeneratorAdapter();

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    hashAdapter,
    validationAdapter,
    passwordGenerator,
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
  const scheduleDiscountRepository = new ScheduleDiscountRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const validationAdapter = new ZodAdapter();
  const discountService = new DiscountService();
  const featureFlagProvider = new JsonFileFeatureFlagProvider(FEATURE_FLAGS_PATH);

  return new RegisterScheduleUseCase(
    scheduleRepository,
    userRepository,
    scheduleDiscountRepository,
    serviceRepository,
    validationAdapter,
    discountService,
    featureFlagProvider,
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
  const storageAdapter = new LocalStorageAdapter({
    assetsDir: ASSETS_DIR,
    publicBaseUrl: `${PUBLIC_BASE_URL.replace(/\/$/, '')}/assets`,
  });

  return new UpdateScheduleUseCase(
    scheduleRepository,
    serviceRepository,
    validationAdapter,
    storageAdapter,
  );
};

export const buildDeleteScheduleUseCase = (): DeleteScheduleUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  const validationAdapter = new ZodAdapter();

  return new DeleteScheduleUseCase(scheduleRepository, validationAdapter);
};

export const buildUploadPhotoUseCase = (): UploadPhotoUseCase => {
  const storageAdapter = new LocalStorageAdapter({
    assetsDir: ASSETS_DIR,
    publicBaseUrl: `${PUBLIC_BASE_URL.replace(/\/$/, '')}/assets`,
  });

  const validationAdapter = new ZodAdapter();

  return new UploadPhotoUseCase(storageAdapter, validationAdapter);
};

export const buildRegisterProductUseCase = (): RegisterProductUseCase => {
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();

  const registerProductUseCase = new RegisterProductUseCase(productRepository, validationAdapter);

  return registerProductUseCase;
};

export const buildGetProductUseCase = (): GetProductUseCase => {
  const productRepository = new ProductRepository(db);

  return new GetProductUseCase(productRepository);
};

export const buildGetProductsUseCase = (): GetProductsUseCase => {
  const productRepository = new ProductRepository(db);

  return new GetProductsUseCase(productRepository);
};

export const buildUpdateProductUseCase = (): UpdateProductUseCase => {
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();

  return new UpdateProductUseCase(productRepository, validationAdapter);
};

export const buildDeleteProductUseCase = (): DeleteProductUseCase => {
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();

  return new DeleteProductUseCase(productRepository, validationAdapter);
};

export const buildCompleteScheduleUseCase = (): CompleteScheduleUseCase => {
  const scheduleRepository = new ScheduleRepository(db);
  const serviceRepository = new ServiceRepository(db);
  const productRepository = new ProductRepository(db);
  const validationAdapter = new ZodAdapter();

  return new CompleteScheduleUseCase(
    scheduleRepository,
    serviceRepository,
    productRepository,
    validationAdapter,
  );
};

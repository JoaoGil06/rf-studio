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

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

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

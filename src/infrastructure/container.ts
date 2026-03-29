import { Pool } from 'pg';
import { DATABASE_URL } from './constants/env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UserRepository } from './repository/user.repository.js';
import { BcryptAdapter } from './adapters/bcrypt.adapter.js';
import { ZodAdapter } from './adapters/zod.adapter.js';
import { RegisterUserUseCase } from '../usecase/register-user/register-user.usecase.js';

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

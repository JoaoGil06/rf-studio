import type { Request } from 'express';
import type { AppContext } from './context.js';
import type { RegisterUserUseCase } from '../../usecase/register-user/register-user.usecase.js';

interface AppUseCases {
  registerUser: RegisterUserUseCase;
}

export function buildContext(useCases: AppUseCases) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async ({ req }: { req: Request }): Promise<AppContext> => ({
    useCases,
  });
}

import { RegisterUserUseCase } from '../../usecase/register-user/register-user.usecase.js';

export interface AppContext {
  useCases: {
    registerUser: RegisterUserUseCase;
  };
}

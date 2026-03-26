import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from './register-user.usecase.js';
import type { IUserRepository } from '../../domain/repository/user-repository.interface.js';
import type { IHashAdapter } from '../interfaces/hash-adapter.interface.js';
import type { IValidationAdapter } from '../interfaces/validation-adapter.interface.js';
import { ConflictError } from '../../domain/@shared/errors/conflictError.js';
import { User } from '../../domain/entity/user/user.entity.js';

const mockRepo: IUserRepository = {
  findByEmail: vi.fn(),
  save: vi.fn(),
};

const mockHash: IHashAdapter = {
  hash: vi.fn().mockResolvedValue('hashed-password'),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const name = 'Ana Rita';
const email = 'anarita@example.com';

const input = {
  name,
  email,
  password: 'secret123',
  phoneNumber: '+351912345678',
};

describe('RegisterUserUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers a new user and returns output DTO', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);

    const usecase = new RegisterUserUseCase(mockRepo, mockHash, mockValidation, 'client-role-uuid');
    const result = await usecase.execute(input);

    expect(result.email).toBe(email);
    expect(result.name).toBe(name);
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('throws ConflictError when email already exists', async () => {
    const fakeUser = { id: 'existing' } as User;
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(fakeUser);
    const usecase = new RegisterUserUseCase(mockRepo, mockHash, mockValidation, 'client-role-uuid');

    await expect(usecase.execute(input)).rejects.toThrow(ConflictError);
  });
});

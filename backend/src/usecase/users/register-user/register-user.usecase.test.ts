import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ZodSchema } from 'zod';
import { RegisterUserUseCase } from './register-user.usecase.js';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { IHashAdapter } from '../../interfaces/hash-adapter.interface.js';
import { IPasswordGeneratorAdapter } from '../../interfaces/password-generator-adapter.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { User } from '../../../domain/entity/user/user.entity.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';

const mockRepo: IUserRepository = {
  findByEmail: vi.fn(),
  findRoleIdByName: vi.fn().mockResolvedValue('client-role-uuid'),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockHash: IHashAdapter = {
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const mockPasswordGenerator: IPasswordGeneratorAdapter = {
  generate: vi.fn().mockReturnValue('generated-password'),
};

const realValidation: IValidationAdapter = {
  validate: <T>(schema: ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new InvalidValueError(result.error.issues.map((issue) => issue.message).join(', '));
    }
    return result.data;
  },
};

const name = 'Ana Rita';
const email = 'anarita@example.com';

const input = {
  name,
  email,
  password: 'secret123',
  phoneNumber: '+351912345678',
};

const buildUseCase = (validation: IValidationAdapter = mockValidation) =>
  new RegisterUserUseCase(mockRepo, mockHash, validation, mockPasswordGenerator);

describe('RegisterUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockHash.hash).mockResolvedValue('hashed-password');
    vi.mocked(mockPasswordGenerator.generate).mockReturnValue('generated-password');
  });

  it('registers a new user and returns output DTO', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.findRoleIdByName).mockResolvedValue('client-role-uuid');

    const usecase = buildUseCase();
    const result = await usecase.execute(input);

    expect(result.email).toBe(email);
    expect(result.name).toBe(name);
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('throws ConflictError when email already exists', async () => {
    const fakeUser = { id: 'existing' } as User;
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(fakeUser);
    const usecase = buildUseCase();

    await expect(usecase.execute(input)).rejects.toThrow(ConflictError);
  });

  it('hashes the supplied password without calling the generator', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.findRoleIdByName).mockResolvedValue('client-role-uuid');

    const usecase = buildUseCase();
    await usecase.execute(input);

    expect(mockPasswordGenerator.generate).not.toHaveBeenCalled();
    expect(mockHash.hash).toHaveBeenCalledWith('secret123');
  });

  it('generates and hashes a password when none is supplied', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.findRoleIdByName).mockResolvedValue('client-role-uuid');

    const usecase = buildUseCase();
    await usecase.execute({
      name,
      email,
      phoneNumber: '+351912345678',
    });

    expect(mockPasswordGenerator.generate).toHaveBeenCalledOnce();
    expect(mockHash.hash).toHaveBeenCalledWith('generated-password');
  });

  it('generates a password when the supplied one is null', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.findRoleIdByName).mockResolvedValue('client-role-uuid');

    const usecase = buildUseCase();
    await usecase.execute({
      name,
      email,
      password: null,
      phoneNumber: '+351912345678',
    });

    expect(mockPasswordGenerator.generate).toHaveBeenCalledOnce();
    expect(mockHash.hash).toHaveBeenCalledWith('generated-password');
  });

  it('rejects a supplied password shorter than 6 characters without generating one', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.findRoleIdByName).mockResolvedValue('client-role-uuid');

    const usecase = buildUseCase(realValidation);

    await expect(
      usecase.execute({
        name,
        email,
        password: 'abc',
        phoneNumber: '+351912345678',
      }),
    ).rejects.toThrow(InvalidValueError);

    expect(mockPasswordGenerator.generate).not.toHaveBeenCalled();
    expect(mockHash.hash).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('never returns the generated password in the output DTO', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.findRoleIdByName).mockResolvedValue('client-role-uuid');

    const usecase = buildUseCase();
    const result = await usecase.execute({
      name,
      email,
      phoneNumber: '+351912345678',
    });

    expect(result).not.toHaveProperty('password');
    expect(Object.values(result)).not.toContain('generated-password');
  });
});

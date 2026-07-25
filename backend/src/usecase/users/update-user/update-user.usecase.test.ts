import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UserFactory } from '../../../domain/entity/user/factory/user.factory.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { UpdateUserUseCase } from './update-user.usecase.js';

const makeUser = () =>
  UserFactory.reconstitute({
    id: '11111111-1111-1111-1111-111111111111',
    roleId: 'role-uuid',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hash',
    phoneNumber: '+351900000000',
    birthDate: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

const mockRepo: IUserRepository = {
  findByEmail: vi.fn(),
  findRoleIdByName: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

describe('UpdateUserUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates name and persists via repository.update', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    const usecase = new UpdateUserUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Johnny',
    });

    expect(result.name).toBe('Johnny');
    expect(mockRepo.update).toHaveBeenCalledOnce();
    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
  });

  it('throws EntityNotFoundError when user does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new UpdateUserUseCase(mockRepo, mockValidation);

    await expect(
      usecase.execute({ id: '11111111-1111-1111-1111-111111111111', name: 'X' }),
    ).rejects.toThrow(EntityNotFoundError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('checks email uniqueness only when email actually changes', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    const usecase = new UpdateUserUseCase(mockRepo, mockValidation);

    await usecase.execute({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'john@example.com',
    });

    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
  });

  it('throws ConflictError when new email is already taken', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'someone-else',
    } as never);
    const usecase = new UpdateUserUseCase(mockRepo, mockValidation);

    await expect(
      usecase.execute({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'taken@example.com',
      }),
    ).rejects.toThrow(ConflictError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('allows email change when no other user owns it', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    const usecase = new UpdateUserUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'new@example.com',
    });

    expect(result.email).toBe('new@example.com');
    expect(mockRepo.update).toHaveBeenCalledOnce();
  });
});

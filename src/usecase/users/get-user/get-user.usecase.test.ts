import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { UserFactory } from '../../../domain/entity/user/factory/user.factory.js';
import { GetUserUseCase } from './get-user.usecase.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';

const makeUser = () =>
  UserFactory.reconstitute({
    id: 'uuid-1',
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
};

describe('GetUserUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the user when found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    const usecase = new GetUserUseCase(mockRepo);
    const result = await usecase.execute({ id: 'uuid-1' });

    expect(result.id).toBe('uuid-1');
    expect(result.email).toBe('john@example.com');
    expect(result.roleId).toBe('role-uuid');
  });

  it('throws EntityNotFoundError when user does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new GetUserUseCase(mockRepo);

    await expect(usecase.execute({ id: 'non-existent' })).rejects.toThrow(EntityNotFoundError);
  });

  it('calls findById with the provided id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    const usecase = new GetUserUseCase(mockRepo);
    await usecase.execute({ id: 'uuid-1' });

    expect(mockRepo.findById).toHaveBeenCalledWith('uuid-1');
  });
});

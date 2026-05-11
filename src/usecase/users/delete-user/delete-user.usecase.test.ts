import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UserFactory } from '../../../domain/entity/user/factory/user.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import DeleteUserUseCase from './delete-user.usecase.js';

const USER_ID = '11111111-1111-1111-1111-111111111111';

const makeUser = () =>
  UserFactory.reconstitute({
    id: USER_ID,
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

describe('DeleteUserUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the user and returns its id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeUser());
    const usecase = new DeleteUserUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: USER_ID });

    expect(result).toEqual({ id: USER_ID });
    expect(mockValidation.validate).toHaveBeenCalledOnce();
    expect(mockRepo.delete).toHaveBeenCalledWith(USER_ID);
    expect(mockRepo.delete).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError when the user does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new DeleteUserUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: USER_ID })).rejects.toThrow(EntityNotFoundError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockValidation.validate).toHaveBeenCalledOnce();
  });
});

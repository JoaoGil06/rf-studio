import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import type { IHashAdapter } from '../../interfaces/hash-adapter.interface.js';
import type { IJwtAdapter } from '../../interfaces/jwt-adapter.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UserFactory } from '../../../domain/entity/user/factory/user.factory.js';
import { UnathorizedError } from '../../../domain/@shared/errors/unathorizedError.js';
import { LoginUseCase } from './login.usecase.js';

const makeUser = () =>
  UserFactory.reconstitute({
    id: 'user-uuid',
    roleId: 'role-uuid',
    name: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hashed-password',
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
};

const mockHashAdapter: IHashAdapter = {
  hash: vi.fn(),
  compare: vi.fn(),
};

const mockJwtAdapter: IJwtAdapter = {
  sign: vi.fn(),
  verify: vi.fn(),
};

const mockValidationAdapter: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const makeUseCase = () =>
  new LoginUseCase(mockRepo, mockHashAdapter, mockJwtAdapter, mockValidationAdapter);

describe('LoginUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns token and user when credentials are valid', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(mockHashAdapter.compare).mockResolvedValue(true);
    vi.mocked(mockJwtAdapter.sign).mockReturnValue('jwt-token');

    const result = await makeUseCase().execute({ email: 'jane@example.com', password: 'secret' });

    expect(result.token).toBe('jwt-token');
    expect(result.user.id).toBe('user-uuid');
    expect(result.user.email).toBe('jane@example.com');
  });

  it('throws UnathorizedError when user does not exist', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);

    await expect(
      makeUseCase().execute({ email: 'ghost@example.com', password: 'x' }),
    ).rejects.toThrow(UnathorizedError);
  });

  it('throws UnathorizedError when password does not match', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(mockHashAdapter.compare).mockResolvedValue(false);

    await expect(
      makeUseCase().execute({ email: 'jane@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnathorizedError);
  });

  it('calls jwtAdapter.sign with correct payload', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(mockHashAdapter.compare).mockResolvedValue(true);
    vi.mocked(mockJwtAdapter.sign).mockReturnValue('jwt-token');

    await makeUseCase().execute({ email: 'jane@example.com', password: 'secret' });

    expect(mockJwtAdapter.sign).toHaveBeenCalledWith({
      sub: 'user-uuid',
      roleId: 'role-uuid',
      email: 'jane@example.com',
    });
  });

  it('does not expose passwordHash in output', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(mockHashAdapter.compare).mockResolvedValue(true);
    vi.mocked(mockJwtAdapter.sign).mockReturnValue('jwt-token');

    const result = await makeUseCase().execute({ email: 'jane@example.com', password: 'secret' });

    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('returns both user-not-found and wrong-password as the same error message', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    const noUserError = await makeUseCase()
      .execute({ email: 'x@x.com', password: 'y' })
      .catch((e) => e);

    vi.mocked(mockRepo.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(mockHashAdapter.compare).mockResolvedValue(false);
    const wrongPwError = await makeUseCase()
      .execute({ email: 'jane@example.com', password: 'wrong' })
      .catch((e) => e);

    expect(noUserError.message).toBe(wrongPwError.message);
  });
});

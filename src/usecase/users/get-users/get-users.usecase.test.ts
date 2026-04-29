import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUsersUseCase } from './get-users.usecase.js';
import { UserFactory } from '../../../domain/entity/user/factory/user.factory.js';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { encodeCursor } from '../../shared/cursor.js';

const makeUser = (i: number) =>
  UserFactory.reconstitute({
    id: `uuid-${i}`,
    roleId: 'role-uuid',
    name: `User ${i}`,
    email: `user${i}@example.com`,
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

describe('GetUsersUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty connection when no users exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetUsersUseCase(mockRepo);
    const result = await usecase.execute({});

    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.pageInfo.hasPreviousPage).toBe(false);
    expect(result.pageInfo.startCursor).toBeNull();
    expect(result.pageInfo.endCursor).toBeNull();
  });

  it('returns edges with opaque cursors and roleId in node', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeUser(1)]);
    const usecase = new GetUsersUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node.email).toBe('user1@example.com');
    expect(result.edges[0].node.roleId).toBe('role-uuid');
    expect(result.edges[0].cursor).toBeDefined();
  });

  it('sets hasNextPage true when more results exist', async () => {
    // first=1 — repo receives limit=2 (first + 1), returns 2 rows
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeUser(1), makeUser(2)]);
    const usecase = new GetUsersUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('sets hasPreviousPage true when after cursor is provided', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeUser(1)]);
    const usecase = new GetUsersUseCase(mockRepo);
    const result = await usecase.execute({ after: encodeCursor(5) });

    expect(result.pageInfo.hasPreviousPage).toBe(true);
  });

  it('passes correct offset to repository when after cursor is given', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetUsersUseCase(mockRepo);
    await usecase.execute({ first: 10, after: encodeCursor(4) });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 11, offset: 5 });
  });

  it('caps first at MAX_PAGE_SIZE (100)', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetUsersUseCase(mockRepo);
    await usecase.execute({ first: 9999 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 101, offset: 0 });
  });
});

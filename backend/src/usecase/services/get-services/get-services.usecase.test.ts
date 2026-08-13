import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetServicesUseCase } from './get-services.usecase.js';
import { encodeCursor } from '../../shared/cursor.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { ServiceFactory } from '../../../domain/entity/service/factory/service.factory.js';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';

const makeService = (i: number) =>
  ServiceFactory.reconstitute({
    id: `svc-${i}`,
    name: `Service ${i}`,
    category: 'nails',
    price: 10 + i,
    durationMinutes: 30,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const mockRepo: IServiceRepository = {
  findByNameAndCategory: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('GetServicesUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty connection when no services exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetServicesUseCase(mockRepo);
    const result = await usecase.execute({});

    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.pageInfo.hasPreviousPage).toBe(false);
    expect(result.pageInfo.startCursor).toBeNull();
    expect(result.pageInfo.endCursor).toBeNull();
  });

  it('returns edges with opaque cursors and mapped node fields', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeService(1)]);
    const usecase = new GetServicesUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node.name).toBe('Service 1');
    expect(result.edges[0].node.price).toBe(11);
    expect(result.edges[0].cursor).toBeDefined();
  });

  it('sets hasNextPage true when more results exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeService(1), makeService(2)]);
    const usecase = new GetServicesUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('sets hasPreviousPage true when an after cursor is provided', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeService(1)]);
    const usecase = new GetServicesUseCase(mockRepo);
    const result = await usecase.execute({ after: encodeCursor(5) });

    expect(result.pageInfo.hasPreviousPage).toBe(true);
  });

  it('passes the correct offset to the repository when after is given', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetServicesUseCase(mockRepo);
    await usecase.execute({ first: 10, after: encodeCursor(4) });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 11, offset: 5, category: undefined });
  });

  it('caps first at MAX_PAGE_SIZE (100)', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetServicesUseCase(mockRepo);
    await usecase.execute({ first: 9999 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 101, offset: 0, category: undefined });
  });
});

describe('GetServicesUseCase — filtering by category', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes a valid category through to the repository', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetServicesUseCase(mockRepo);
    await usecase.execute({ first: 25, category: 'eyebrows' });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 26, offset: 0, category: 'eyebrows' });
  });

  // A client that leaves the variable unset sends `category: null`; that must not
  // be mistaken for a category named "null".
  it('treats an explicit null as the whole catalogue', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetServicesUseCase(mockRepo);
    await usecase.execute({ first: 25, category: null });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 26, offset: 0, category: undefined });
  });

  it('normalises the category through the value object', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetServicesUseCase(mockRepo);
    await usecase.execute({ category: ' NAILS ' });

    expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({ category: 'nails' }));
  });

  it('rejects an unknown category instead of returning an empty catalogue', async () => {
    const usecase = new GetServicesUseCase(mockRepo);

    await expect(usecase.execute({ category: 'banana' })).rejects.toThrow(InvalidValueError);
    expect(mockRepo.findAll).not.toHaveBeenCalled();
  });
});

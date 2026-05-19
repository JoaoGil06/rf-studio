import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetServiceUseCase } from './get-service.usecase.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { ServiceFactory } from '../../../domain/entity/service/factory/service.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';

const makeService = () =>
  ServiceFactory.reconstitute({
    id: 'svc-1',
    name: 'French Manicure',
    category: 'nails',
    price: 25.5,
    durationMinutes: 45,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const mockRepo: IServiceRepository = {
  findByNameAndCategory: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
};

describe('GetServiceUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the service when found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    const usecase = new GetServiceUseCase(mockRepo);

    const result = await usecase.execute({ id: 'svc-1' });

    expect(result.id).toBe('svc-1');
    expect(result.name).toBe('French Manicure');
    expect(result.category).toBe('nails');
    expect(result.price).toBe(25.5);
    expect(result.durationMinutes).toBe(45);
  });

  it('throws EntityNotFoundError when the service does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new GetServiceUseCase(mockRepo);

    await expect(usecase.execute({ id: 'missing' })).rejects.toThrow(EntityNotFoundError);
  });

  it('calls findById with the provided id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    const usecase = new GetServiceUseCase(mockRepo);
    await usecase.execute({ id: 'svc-1' });

    expect(mockRepo.findById).toHaveBeenCalledWith('svc-1');
  });
});

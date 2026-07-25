import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ServiceFactory } from '../../../domain/entity/service/factory/service.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { DeleteServiceUseCase } from './delete-service.usecase.js';

const SVC_ID = '11111111-1111-1111-1111-111111111111';

const makeService = () =>
  ServiceFactory.reconstitute({
    id: SVC_ID,
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
  update: vi.fn(),
  delete: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

describe('DeleteServiceUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the service and returns its id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    const usecase = new DeleteServiceUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: SVC_ID });

    expect(result).toEqual({ id: SVC_ID });
    expect(mockRepo.delete).toHaveBeenCalledWith(SVC_ID);
    expect(mockRepo.delete).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError when the service does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new DeleteServiceUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: SVC_ID })).rejects.toThrow(EntityNotFoundError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('validates input before touching the repository', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    const usecase = new DeleteServiceUseCase(mockRepo, mockValidation);

    await usecase.execute({ id: SVC_ID });

    expect(mockValidation.validate).toHaveBeenCalledOnce();
  });
});

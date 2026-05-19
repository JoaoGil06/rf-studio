import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateServiceUseCase } from './update-service.usecase.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ServiceFactory } from '../../../domain/entity/service/factory/service.factory.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';

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
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

describe('UpdateServiceUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates price and persists via repository.update', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    const usecase = new UpdateServiceUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: SVC_ID, price: 30 });

    expect(result.price).toBe(30);
    expect(mockRepo.update).toHaveBeenCalledOnce();
    expect(mockRepo.findByNameAndCategory).not.toHaveBeenCalled();
  });

  it('throws EntityNotFoundError when the service does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new UpdateServiceUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: SVC_ID, name: 'X' })).rejects.toThrow(EntityNotFoundError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('does not run the uniqueness check when name/category are unchanged', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    const usecase = new UpdateServiceUseCase(mockRepo, mockValidation);

    await usecase.execute({ id: SVC_ID, name: 'French Manicure', category: 'nails' });

    expect(mockRepo.findByNameAndCategory).not.toHaveBeenCalled();
  });

  it('throws ConflictError when the new (name, category) belongs to another service', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    vi.mocked(mockRepo.findByNameAndCategory).mockResolvedValue({ id: 'other-id' } as never);
    const usecase = new UpdateServiceUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: SVC_ID, name: 'Gel Manicure' })).rejects.toThrow(
      ConflictError,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('allows the rename when no other service owns the new pair', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    vi.mocked(mockRepo.findByNameAndCategory).mockResolvedValue(null);
    const usecase = new UpdateServiceUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: SVC_ID, name: 'Gel Manicure' });

    expect(result.name).toBe('Gel Manicure');
    expect(mockRepo.update).toHaveBeenCalledOnce();
  });

  it('treats a self-match in the uniqueness check as no conflict', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeService());
    vi.mocked(mockRepo.findByNameAndCategory).mockResolvedValue({ id: SVC_ID } as never);
    const usecase = new UpdateServiceUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: SVC_ID, category: 'eyebrows' });

    expect(result.category).toBe('eyebrows');
    expect(mockRepo.update).toHaveBeenCalledOnce();
  });
});

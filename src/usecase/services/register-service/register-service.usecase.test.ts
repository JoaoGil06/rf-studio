import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterServiceUseCase } from './register-service.usecase.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';

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

const input = {
  name: 'French Manicure',
  category: 'nails',
  price: 25.5,
  durationMinutes: 45,
};

describe('RegisterServiceUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers a new service and returns the output DTO', async () => {
    vi.mocked(mockRepo.findByNameAndCategory).mockResolvedValue(null);
    const usecase = new RegisterServiceUseCase(mockRepo, mockValidation);

    const result = await usecase.execute(input);

    expect(result.name).toBe('French Manicure');
    expect(result.category).toBe('nails');
    expect(result.price).toBe(25.5);
    expect(result.durationMinutes).toBe(45);
    expect(result.id).toMatch(/[0-9a-f-]{36}/);
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('throws ConflictError when the same name + category already exists', async () => {
    vi.mocked(mockRepo.findByNameAndCategory).mockResolvedValue({ id: 'existing' } as never);
    const usecase = new RegisterServiceUseCase(mockRepo, mockValidation);

    await expect(usecase.execute(input)).rejects.toThrow(ConflictError);
  });
});

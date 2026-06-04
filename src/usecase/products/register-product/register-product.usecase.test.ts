import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterProductUseCase } from './register-product.usecase.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import type { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';

const mockRepo: IProductRepository = {
  findByNameAndBrand: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const input = {
  name: 'Red Gel Polish',
  brand: 'OPI',
  color: 'red',
};

describe('RegisterProductUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers a new product and returns the output DTO', async () => {
    vi.mocked(mockRepo.findByNameAndBrand).mockResolvedValue(null);
    const usecase = new RegisterProductUseCase(mockRepo, mockValidation);

    const result = await usecase.execute(input);

    expect(result.name).toBe('Red Gel Polish');
    expect(result.brand).toBe('OPI');
    expect(result.color).toBe('red');
    expect(result.isAvailable).toBe(true);
    expect(result.id).toMatch(/[0-9a-f-]{36}/);
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('defaults isAvailable to true and color to null when omitted', async () => {
    vi.mocked(mockRepo.findByNameAndBrand).mockResolvedValue(null);
    const usecase = new RegisterProductUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ name: 'Base Coat', brand: 'Essie' });

    expect(result.isAvailable).toBe(true);
    expect(result.color).toBeNull();
  });

  it('throws ConflictError when the same name + brand already exists', async () => {
    vi.mocked(mockRepo.findByNameAndBrand).mockResolvedValue({ id: 'existing' } as never);
    const usecase = new RegisterProductUseCase(mockRepo, mockValidation);

    await expect(usecase.execute(input)).rejects.toThrow(ConflictError);
  });
});
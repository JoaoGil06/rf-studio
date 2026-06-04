import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProductUseCase } from './update-product.usecase.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import type { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ProductFactory } from '../../../domain/entity/product/factory/product.factory.js';

const makeProduct = () =>
  ProductFactory.reconstitute({
    id: 'prod-1',
    name: 'Red Gel Polish',
    brand: 'OPI',
    color: 'red',
    isAvailable: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

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

describe('UpdateProductUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates the product and returns the output DTO', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    const usecase = new UpdateProductUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: 'prod-1', isAvailable: false });

    expect(result.isAvailable).toBe(false);
    expect(result.name).toBe('Red Gel Polish');
    expect(mockRepo.update).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError when the product does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new UpdateProductUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: 'missing', name: 'X' })).rejects.toThrow(
      EntityNotFoundError,
    );
  });

  it('re-checks name+brand uniqueness only when one changes, throwing ConflictError on a clash', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    vi.mocked(mockRepo.findByNameAndBrand).mockResolvedValue({ id: 'other' } as never);
    const usecase = new UpdateProductUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: 'prod-1', name: 'Blue Polish' })).rejects.toThrow(
      ConflictError,
    );
  });

  it('does not re-check uniqueness when neither name nor brand changes', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    const usecase = new UpdateProductUseCase(mockRepo, mockValidation);

    await usecase.execute({ id: 'prod-1', color: 'pink' });

    expect(mockRepo.findByNameAndBrand).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProductUseCase } from './get-product.usecase.js';
import type { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { ProductFactory } from '../../../domain/entity/product/factory/product.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';

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
};

describe('GetProductUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the product when found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    const usecase = new GetProductUseCase(mockRepo);

    const result = await usecase.execute({ id: 'prod-1' });

    expect(result.id).toBe('prod-1');
    expect(result.name).toBe('Red Gel Polish');
    expect(result.brand).toBe('OPI');
    expect(result.color).toBe('red');
    expect(result.isAvailable).toBe(true);
  });

  it('throws EntityNotFoundError when the product does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new GetProductUseCase(mockRepo);

    await expect(usecase.execute({ id: 'missing' })).rejects.toThrow(EntityNotFoundError);
  });

  it('calls findById with the provided id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    const usecase = new GetProductUseCase(mockRepo);
    await usecase.execute({ id: 'prod-1' });

    expect(mockRepo.findById).toHaveBeenCalledWith('prod-1');
  });
});

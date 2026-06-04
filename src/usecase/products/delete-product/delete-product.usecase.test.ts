import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ProductFactory } from '../../../domain/entity/product/factory/product.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { DeleteProductUseCase } from './delete-product.usecase.js';

const PROD_ID = '11111111-1111-1111-1111-111111111111';

const makeProduct = () =>
  ProductFactory.reconstitute({
    id: PROD_ID,
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
  delete: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

describe('DeleteProductUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the product and returns its id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    const usecase = new DeleteProductUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: PROD_ID });

    expect(result).toEqual({ id: PROD_ID });
    expect(mockRepo.delete).toHaveBeenCalledWith(PROD_ID);
    expect(mockRepo.delete).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError when the product does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new DeleteProductUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: PROD_ID })).rejects.toThrow(EntityNotFoundError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('validates input before touching the repository', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProduct());
    const usecase = new DeleteProductUseCase(mockRepo, mockValidation);

    await usecase.execute({ id: PROD_ID });

    expect(mockValidation.validate).toHaveBeenCalledOnce();
  });
});

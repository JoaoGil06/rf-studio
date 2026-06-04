import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProductsUseCase } from './get-products.usecase.js';
import { encodeCursor } from '../../shared/cursor.js';
import type { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { ProductFactory } from '../../../domain/entity/product/factory/product.factory.js';

const makeProduct = (i: number) =>
  ProductFactory.reconstitute({
    id: `prod-${i}`,
    name: `Product ${i}`,
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

describe('GetProductsUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty connection when no products exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetProductsUseCase(mockRepo);
    const result = await usecase.execute({});

    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.pageInfo.hasPreviousPage).toBe(false);
    expect(result.pageInfo.startCursor).toBeNull();
    expect(result.pageInfo.endCursor).toBeNull();
  });

  it('returns edges with opaque cursors and mapped node fields', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeProduct(1)]);
    const usecase = new GetProductsUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node.name).toBe('Product 1');
    expect(result.edges[0].node.brand).toBe('OPI');
    expect(result.edges[0].cursor).toBeDefined();
  });

  it('sets hasNextPage true when more results exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeProduct(1), makeProduct(2)]);
    const usecase = new GetProductsUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('sets hasPreviousPage true when an after cursor is provided', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeProduct(1)]);
    const usecase = new GetProductsUseCase(mockRepo);
    const result = await usecase.execute({ after: encodeCursor(5) });

    expect(result.pageInfo.hasPreviousPage).toBe(true);
  });

  it('passes the correct offset to the repository when after is given', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetProductsUseCase(mockRepo);
    await usecase.execute({ first: 10, after: encodeCursor(4) });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 11, offset: 5 });
  });

  it('caps first at MAX_PAGE_SIZE (100)', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetProductsUseCase(mockRepo);
    await usecase.execute({ first: 9999 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 101, offset: 0 });
  });
});

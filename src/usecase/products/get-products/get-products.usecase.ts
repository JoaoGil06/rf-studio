import { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { decodeCursor, encodeCursor } from '../../shared/cursor.js';
import { GetProductsInputDto, GetProductsOutputDto, ProductNodeDto } from './get-products.dto.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class GetProductsUseCase {
  private readonly productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(input: GetProductsInputDto): Promise<GetProductsOutputDto> {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;

    // Over-fetch by one to know whether a next page exists
    const rows = await this.productRepository.findAll({ limit: first + 1, offset });

    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;

    const edges = items.map((product, index) => {
      const node: ProductNodeDto = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        color: product.color,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt.toISOString(),
      };

      return { node, cursor: encodeCursor(offset + index) };
    });

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
    };
  }
}

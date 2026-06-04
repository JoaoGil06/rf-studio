import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { GetProductInputDto, GetProductOutputDto } from './get-product.dto.js';

export class GetProductUseCase {
  private readonly productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(input: GetProductInputDto): Promise<GetProductOutputDto> {
    const product = await this.productRepository.findById(input.id);

    if (!product) throw new EntityNotFoundError(`Product with id ${input.id} not found`);

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      color: product.color,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt.toISOString(),
    };
  }
}

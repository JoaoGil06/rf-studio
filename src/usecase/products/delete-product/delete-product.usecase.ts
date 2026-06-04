import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { DeleteProductInputDto, DeleteProductOutputDto } from './delete-product.dto.js';
import { deleteProductSchema } from './delete-product.schema-validator.js';

export class DeleteProductUseCase {
  private productRepository: IProductRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(productRepository: IProductRepository, validationAdapter: IValidationAdapter) {
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: DeleteProductInputDto): Promise<DeleteProductOutputDto> {
    const validated = this.validationAdapter.validate<DeleteProductInputDto>(
      deleteProductSchema,
      input,
    );

    const product = await this.productRepository.findById(validated.id);
    if (!product) {
      throw new EntityNotFoundError(`Product with id ${validated.id} not found`);
    }

    await this.productRepository.delete(product.id);

    return { id: product.id };
  }
}

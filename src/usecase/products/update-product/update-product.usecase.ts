import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UpdateProductInputDto, UpdateProductOutputDto } from './update-product.dto.js';
import { updateProductSchema } from './update-product.schema-validator.js';

export class UpdateProductUseCase {
  private productRepository: IProductRepository;
  private validationAdapter: IValidationAdapter;

  constructor(productRepository: IProductRepository, validationAdapter: IValidationAdapter) {
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: UpdateProductInputDto): Promise<UpdateProductOutputDto> {
    const validated = this.validationAdapter.validate<UpdateProductInputDto>(
      updateProductSchema,
      input,
    );

    const productFound = await this.productRepository.findById(validated.id);

    if (!productFound) {
      throw new EntityNotFoundError(`Product with id ${validated.id} not found`);
    }

    const newName = validated.name ?? productFound.name;
    const newBrand = validated.brand ?? productFound.brand;
    const nameOrBrandChanged = newName !== productFound.name || newBrand !== productFound.brand;

    if (nameOrBrandChanged) {
      const existing = await this.productRepository.findByNameAndBrand(newName, newBrand);

      if (existing && existing.id !== productFound.id) {
        throw new ConflictError(`Product already registered: ${newName} (${newBrand})`);
      }
    }

    productFound.updateProductDetails({
      name: validated.name,
      brand: validated.brand,
      color: validated.color,
      isAvailable: validated.isAvailable,
    });

    await this.productRepository.update(productFound);

    return {
      id: productFound.id,
      name: productFound.name,
      brand: productFound.brand,
      color: productFound.color,
      isAvailable: productFound.isAvailable,
      createdAt: productFound.createdAt.toISOString(),
    };
  }
}

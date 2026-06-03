import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { ProductFactory } from '../../../domain/entity/product/factory/product.factory.js';
import { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { RegisterProductInputDto, RegisterProductOutputDto } from './register-product.dto.js';
import { registerProductSchema } from './register-product.schema-validator.js';

export class RegisterProductUseCase {
  private readonly productRepository: IProductRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(productRepository: IProductRepository, validationAdapter: IValidationAdapter) {
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(inputDto: RegisterProductInputDto): Promise<RegisterProductOutputDto> {
    const validatedInput = this.validationAdapter.validate<RegisterProductInputDto>(
      registerProductSchema,
      inputDto,
    );

    const alreadyExistsProduct = await this.productRepository.findByNameAndBrand(
      validatedInput.name,
      validatedInput.brand,
    );

    if (alreadyExistsProduct) {
      throw new ConflictError(
        `Product already registered: ${validatedInput.name} (${validatedInput.brand})`,
      );
    }

    const product = ProductFactory.create({
      name: validatedInput.name,
      brand: validatedInput.brand,
      color: validatedInput.color ?? null,
      isAvailable: validatedInput.isAvailable,
    });

    await this.productRepository.save(product);

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
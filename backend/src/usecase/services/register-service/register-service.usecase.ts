import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { ServiceFactory } from '../../../domain/entity/service/factory/service.factory.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { RegisterServiceInputDto, RegisterServiceOutputDto } from './register-service.dto.js';
import { registerServiceSchema } from './register-service.schema-validator.js';

export class RegisterServiceUseCase {
  private readonly serviceRepository: IServiceRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(serviceRepository: IServiceRepository, validationAdapter: IValidationAdapter) {
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(inputDto: RegisterServiceInputDto): Promise<RegisterServiceOutputDto> {
    const validatedInput = this.validationAdapter.validate<RegisterServiceInputDto>(
      registerServiceSchema,
      inputDto,
    );

    const alreadyExistsService = await this.serviceRepository.findByNameAndCategory(
      validatedInput.name,
      validatedInput.category,
    );

    if (alreadyExistsService) {
      throw new ConflictError(
        `Service already registered: ${validatedInput.name} (${validatedInput.category})`,
      );
    }

    const service = ServiceFactory.create({
      name: validatedInput.name,
      category: validatedInput.category,
      durationMinutes: validatedInput.durationMinutes,
      price: validatedInput.price,
    });

    await this.serviceRepository.save(service);

    return {
      id: service.id,
      name: service.name,
      category: service.category.value,
      price: service.price.value,
      durationMinutes: service.durationMinutes,
      createdAt: service.createdAt.toISOString(),
    };
  }
}

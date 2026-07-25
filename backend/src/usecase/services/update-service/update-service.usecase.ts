import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UpdateServiceInputDto, UpdateServiceOutputDto } from './update-service.dto.js';
import { updateServiceSchema } from './update-service.schema-validator.js';

export class UpdateServiceUseCase {
  private serviceRepository: IServiceRepository;
  private validationAdapter: IValidationAdapter;

  constructor(serviceRepository: IServiceRepository, validationAdapter: IValidationAdapter) {
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: UpdateServiceInputDto): Promise<UpdateServiceOutputDto> {
    const validated = this.validationAdapter.validate<UpdateServiceInputDto>(
      updateServiceSchema,
      input,
    );

    const serviceFound = await this.serviceRepository.findById(validated.id);

    if (!serviceFound) throw new EntityNotFoundError(`Service with id ${validated.id} not found`);

    const newName = validated.name ?? serviceFound.name;
    const newCategory = validated.category ?? serviceFound.category.value;
    const nameAndCategoryChanged =
      newName !== serviceFound.name || newCategory !== serviceFound.category.value;

    if (nameAndCategoryChanged) {
      const existing = await this.serviceRepository.findByNameAndCategory(newName, newCategory);

      if (existing && existing.id !== serviceFound.id) {
        throw new ConflictError(`Service already registered: ${newName} (${newCategory})`);
      }
    }

    serviceFound.updateServiceDetails({
      name: validated.name,
      category: validated.category,
      price: validated.price,
      durationMinutes: validated.durationMinutes,
    });

    await this.serviceRepository.update(serviceFound);

    return {
      id: serviceFound.id,
      name: serviceFound.name,
      category: serviceFound.category.value,
      price: serviceFound.price.value,
      durationMinutes: serviceFound.durationMinutes,
      createdAt: serviceFound.createdAt.toISOString(),
    };
  }
}

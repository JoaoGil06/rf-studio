import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { DeleteServiceInputDto, DeleteServiceOutputDto } from './delete-service.dto.js';
import { deleteServiceSchema } from './delete-service.schema-validator.js';

export class DeleteServiceUseCase {
  private serviceRepository: IServiceRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(serviceRepository: IServiceRepository, validationAdapter: IValidationAdapter) {
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: DeleteServiceInputDto): Promise<DeleteServiceOutputDto> {
    const validated = this.validationAdapter.validate<DeleteServiceInputDto>(
      deleteServiceSchema,
      input,
    );

    const service = await this.serviceRepository.findById(validated.id);
    if (!service) {
      throw new EntityNotFoundError(`Service with id ${validated.id} not found`);
    }

    await this.serviceRepository.delete(service.id);

    return { id: service.id };
  }
}

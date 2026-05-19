import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { GetServiceInputDto, GetServiceOutputDto } from './get-service.dto.js';

export class GetServiceUseCase {
  private readonly serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(input: GetServiceInputDto): Promise<GetServiceOutputDto> {
    const service = await this.serviceRepository.findById(input.id);

    if (!service) throw new EntityNotFoundError(`Service with id ${input.id} not found`);

    return {
      id: service.id,
      name: service.name,
      category: service.category.value,
      durationMinutes: service.durationMinutes,
      price: service.price.value,
      createdAt: service.createdAt.toISOString(),
    };
  }
}

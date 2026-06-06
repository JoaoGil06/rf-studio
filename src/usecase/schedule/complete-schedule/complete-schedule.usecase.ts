import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';
import { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { ScheduleStatusService } from '../../../domain/service/schedule-status/schedule-status.service.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { CompleteScheduleInputDto, CompleteScheduleOutputDto } from './complete-schedule.dto.js';
import { completeScheduleSchema } from './complete-schedule.schema-validator.js';

export class CompleteScheduleUseCase {
  private readonly scheduleRepository: IScheduleRepository;
  private readonly serviceRepository: IServiceRepository;
  private readonly productRepository: IProductRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(
    scheduleRepository: IScheduleRepository,
    serviceRepository: IServiceRepository,
    productRepository: IProductRepository,
    validationAdapter: IValidationAdapter,
  ) {
    this.scheduleRepository = scheduleRepository;
    this.serviceRepository = serviceRepository;
    this.productRepository = productRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: CompleteScheduleInputDto): Promise<CompleteScheduleOutputDto> {
    const validated = this.validationAdapter.validate<CompleteScheduleInputDto>(
      completeScheduleSchema,
      input,
    );

    const schedule = await this.scheduleRepository.findById(validated.scheduleId);
    if (!schedule) throw new EntityNotFoundError(`Schedule not found: ${validated.scheduleId}`);

    // Verificar se a transição de estado, é válida
    ScheduleStatusService.assertCanTransition(schedule.status.value, 'completed');

    const service = await this.serviceRepository.findById(schedule.serviceId);
    if (!service) {
      throw new EntityNotFoundError(`Service not found: ${schedule.serviceId}`);
    }

    const uniqueIds = [...new Set(validated.productIds)];
    const products = await this.productRepository.findByIds(uniqueIds);

    if (products.length !== uniqueIds.length) {
      throw new EntityNotFoundError(`Product not found in: ${uniqueIds.join(', ')}`);
    }

    const serviceCategory = service.category.value;
    // Validar se todos os produtos são da mesma categoria que a schedule
    for (const product of products) {
      if (product.category.value !== serviceCategory) {
        throw new InvalidValueError(
          `Product ${product.id} (${product.category.value}) does not match service category ${serviceCategory}`,
        );
      }
    }

    schedule.updateScheduleDetails({ status: 'completed' });
    await this.scheduleRepository.complete(schedule, uniqueIds);

    return {
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date.toISOString(),
      photoUrl: schedule.photoUrl,
      createdAt: schedule.createdAt.toISOString(),
    };
  }
}

import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { ScheduleConflictService } from '../../../domain/service/schedule-conflict/schedule-conflict.service.js';
import { IStorageAdapter } from '../../interfaces/storage-adapter.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UpdateScheduleInputDto, UpdateScheduleOutputDto } from './update-schedule.dto.js';
import { updateScheduleSchema } from './update-schedule.schema-validator.js';

export class UpdateScheduleUseCase {
  private readonly scheduleRepository: IScheduleRepository;
  private readonly serviceRepository: IServiceRepository;
  private readonly validationAdapter: IValidationAdapter;
  private readonly storageAdapter: IStorageAdapter;

  constructor(
    scheduleRepository: IScheduleRepository,
    serviceRepository: IServiceRepository,
    validationAdapter: IValidationAdapter,
    storageAdapter: IStorageAdapter,
  ) {
    this.scheduleRepository = scheduleRepository;
    this.serviceRepository = serviceRepository;
    this.validationAdapter = validationAdapter;
    this.storageAdapter = storageAdapter;
  }

  async execute(inputDto: UpdateScheduleInputDto): Promise<UpdateScheduleOutputDto> {
    const validated = this.validationAdapter.validate<UpdateScheduleInputDto>(
      updateScheduleSchema,
      inputDto,
    );

    const schedule = await this.scheduleRepository.findById(validated.id);
    if (!schedule) {
      throw new EntityNotFoundError(`Schedule not found: ${validated.id}`);
    }

    const previousPhotoUrl = schedule.photoUrl;
    const nextServiceId = validated.serviceId ?? schedule.serviceId;
    const nextDate = validated.date ?? schedule.date;
    const timingChanged = validated.serviceId !== undefined || validated.date !== undefined;

    if (timingChanged) {
      const service = await this.serviceRepository.findById(nextServiceId);
      if (!service) {
        throw new EntityNotFoundError(`Service not found: ${nextServiceId}`);
      }

      const conflict = await ScheduleConflictService.hasConflict(
        nextDate,
        service.durationMinutes,
        this.scheduleRepository,
        schedule.id,
      );
      if (conflict) {
        throw new ConflictError(`Time slot already booked: ${nextDate.toISOString()}`);
      }
    }

    schedule.updateScheduleDetails({
      status: validated.status,
      date: validated.date,
      serviceId: validated.serviceId,
      photoUrl: validated.photoUrl,
    });

    await this.scheduleRepository.update(schedule);

    // Remove the replaced file so it doesn't orphan on disk.
    if (
      validated.photoUrl !== undefined &&
      previousPhotoUrl !== null &&
      previousPhotoUrl !== schedule.photoUrl
    ) {
      await this.storageAdapter.delete(previousPhotoUrl);
    }

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

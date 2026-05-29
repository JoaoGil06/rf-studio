import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { GetScheduleInputDto, GetScheduleOutputDto } from './get-schedule.dto.js';

export class GetScheduleUseCase {
  private readonly scheduleRepository: IScheduleRepository;

  constructor(scheduleRepository: IScheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute(input: GetScheduleInputDto): Promise<GetScheduleOutputDto> {
    const schedule = await this.scheduleRepository.findById(input.id);

    if (!schedule) throw new EntityNotFoundError(`Schedule with id ${input.id} not found`);

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

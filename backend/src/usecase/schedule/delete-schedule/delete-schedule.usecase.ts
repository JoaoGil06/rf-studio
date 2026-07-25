import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { DeleteScheduleInputDto, DeleteScheduleOutputDto } from './delete-schedule.dto.js';
import { deleteScheduleSchema } from './delete-schedule.schema-validator.js';

export class DeleteScheduleUseCase {
  private readonly scheduleRepository: IScheduleRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(scheduleRepository: IScheduleRepository, validationAdapter: IValidationAdapter) {
    this.scheduleRepository = scheduleRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: DeleteScheduleInputDto): Promise<DeleteScheduleOutputDto> {
    const validated = this.validationAdapter.validate<DeleteScheduleInputDto>(
      deleteScheduleSchema,
      input,
    );

    const schedule = await this.scheduleRepository.findById(validated.id);
    if (!schedule) {
      throw new EntityNotFoundError(`Schedule with id ${validated.id} not found`);
    }

    await this.scheduleRepository.delete(schedule.id);

    return { id: schedule.id };
  }
}

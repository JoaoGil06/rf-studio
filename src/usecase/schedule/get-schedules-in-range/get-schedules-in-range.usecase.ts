import { ScheduleStatusValue } from '../../../domain/@shared/value-object/schedule-status/schedule-status.vo.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { ScheduleRangeService } from '../../../domain/service/schedule-range/schedule-range.service.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import {
  GetSchedulesInRangeInputDto,
  GetSchedulesInRangeOutputDto,
} from './get-schedules-in-range.dto.js';
import { getSchedulesInRangeSchema } from './get-schedules-in-range.schema-validator.js';

export class GetSchedulesInRangeUseCase {
  private readonly scheduleRepository: IScheduleRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(scheduleRepository: IScheduleRepository, validationAdapter: IValidationAdapter) {
    this.scheduleRepository = scheduleRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: GetSchedulesInRangeInputDto): Promise<GetSchedulesInRangeOutputDto> {
    const validatedData = this.validationAdapter.validate<GetSchedulesInRangeInputDto>(
      getSchedulesInRangeSchema,
      input,
    );

    const { from, to } = ScheduleRangeService.computeRange({
      year: validatedData.filter.year ?? undefined,
      month: validatedData.filter.month ?? undefined,
      weekStart: validatedData.filter.weekStart ?? undefined,
    });

    const status = validatedData.filter.status ?? undefined;

    const rows = await this.scheduleRepository.findInRange({
      from,
      to,
      userId: validatedData.filter.userId ?? undefined,
      status: status as ScheduleStatusValue | undefined,
    });

    return rows.map((scheduleRow) => ({
      id: scheduleRow.id,
      userId: scheduleRow.userId,
      serviceId: scheduleRow.serviceId,
      status: scheduleRow.status.value,
      date: scheduleRow.date.toISOString(),
      photoUrl: scheduleRow.photoUrl,
      tip: scheduleRow.tip,
      createdAt: scheduleRow.createdAt.toISOString(),
    }));
  }
}

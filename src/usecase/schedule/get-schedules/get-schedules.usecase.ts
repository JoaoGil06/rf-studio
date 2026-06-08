import { ScheduleStatusValue } from '../../../domain/@shared/value-object/schedule-status/schedule-status.vo.js';
import { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { decodeCursor, encodeCursor } from '../../shared/cursor.js';
import {
  GetSchedulesInputDto,
  GetSchedulesOutputDto,
  ScheduleNodeDto,
} from './get-schedules.dto.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class GetSchedulesUseCase {
  private readonly scheduleRepository: IScheduleRepository;

  constructor(scheduleRepository: IScheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute(input: GetSchedulesInputDto): Promise<GetSchedulesOutputDto> {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;
    const userId = input.filter?.userId ?? undefined;

    const status = input.filter?.status ?? undefined;

    const rows = await this.scheduleRepository.findAll({
      limit: first + 1,
      offset,
      userId,
      status: status as ScheduleStatusValue | undefined,
    });

    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;

    const edges = items.map((schedule, index) => {
      const node: ScheduleNodeDto = {
        id: schedule.id,
        userId: schedule.userId,
        serviceId: schedule.serviceId,
        status: schedule.status.value,
        date: schedule.date.toISOString(),
        photoUrl: schedule.photoUrl,
        createdAt: schedule.createdAt.toISOString(),
      };

      return { node, cursor: encodeCursor(offset + index) };
    });

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
    };
  }
}

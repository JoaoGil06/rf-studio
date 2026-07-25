import { ScheduleStatusValue } from '../@shared/value-object/schedule-status/schedule-status.vo.js';
import { Schedule } from '../entity/schedule/schedule.entity.js';

export interface ScheduleListParams {
  limit: number;
  offset: number;
  userId?: string;
  status?: ScheduleStatusValue;
}

export interface ScheduleRangeParams {
  from: Date;
  to: Date;
  userId?: string;
  status?: ScheduleStatusValue;
}

export interface IScheduleRepository {
  save(schedule: Schedule): Promise<void>;
  // O excludeID é para quando estamso a fazer o update
  // Assim não há colisão da marcação que estamos a fazer com ela mesma
  findOverlapping(start: Date, end: Date, excludeId?: string): Promise<Schedule[]>;
  findById(id: string): Promise<Schedule | null>;
  findAll(params: ScheduleListParams): Promise<Schedule[]>;
  findInRange(params: ScheduleRangeParams): Promise<Schedule[]>;
  update(schedule: Schedule): Promise<void>;
  delete(id: string): Promise<void>;
  // Isto é o "atomic write (do ACID)" em que fazermos um status UPDATE + join INSERT em uma só transaction
  complete(schedule: Schedule, productIds: string[]): Promise<void>;
  countCompletedForLoyalty(userId: string): Promise<number>;
}

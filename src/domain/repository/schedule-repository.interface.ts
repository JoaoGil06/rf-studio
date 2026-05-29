import { Schedule } from '../entity/schedule/schedule.entity.js';

export interface ScheduleListParams {
  limit: number;
  offset: number;
  userId?: string;
}

export interface ScheduleRangeParams {
  from: Date;
  to: Date;
  userId?: string;
}

export interface IScheduleRepository {
  save(schedule: Schedule): Promise<void>;
  findOverlapping(start: Date, end: Date): Promise<Schedule[]>;
  findById(id: string): Promise<Schedule | null>;
  findAll(params: ScheduleListParams): Promise<Schedule[]>;
  findInRange(params: ScheduleRangeParams): Promise<Schedule[]>;
}

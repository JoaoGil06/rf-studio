import { Schedule } from '../entity/schedule/schedule.entity.js';

export interface IScheduleRepository {
  save(schedule: Schedule): Promise<void>;
  findOverlapping(start: Date, end: Date): Promise<Schedule[]>;
}

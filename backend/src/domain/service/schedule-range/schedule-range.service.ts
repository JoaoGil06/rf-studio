import { InvalidValueError } from '../../@shared/errors/invalidValueError.js';

export interface ScheduleRangeFilter {
  year?: number;
  month?: number;
  weekStart?: Date;
}

export interface ScheduleRange {
  from: Date;
  to: Date;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class ScheduleRangeService {
  public static computeRange(filter: ScheduleRangeFilter): ScheduleRange {
    if (filter.weekStart) {
      const from = new Date(filter.weekStart.getTime());
      const to = new Date(from.getTime() + WEEK_MS);
      return { from, to };
    }

    if (filter.year !== undefined && filter.month !== undefined) {
      const from = new Date(Date.UTC(filter.year, filter.month - 1, 1));
      const to = new Date(Date.UTC(filter.year, filter.month, 1));
      return { from, to };
    }

    if (filter.year !== undefined) {
      const from = new Date(Date.UTC(filter.year, 0, 1));
      const to = new Date(Date.UTC(filter.year + 1, 0, 1));
      return { from, to };
    }

    throw new InvalidValueError(
      'Invalid schedule range filter: provide weekStart, year+month, or year',
    );
  }
}

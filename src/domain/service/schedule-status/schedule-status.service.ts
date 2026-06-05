import { ConflictError } from '../../@shared/errors/conflictError.js';
import { ScheduleStatusValue } from '../../@shared/value-object/schedule-status/schedule-status.vo.js';

const TRANSICTIONS: Record<ScheduleStatusValue, ReadonlySet<ScheduleStatusValue>> = {
  pending: new Set<ScheduleStatusValue>(['confirmed', 'cancelled']),
  confirmed: new Set<ScheduleStatusValue>(['completed', 'cancelled']),
  completed: new Set<ScheduleStatusValue>(),
  cancelled: new Set<ScheduleStatusValue>(),
};

export class ScheduleStatusService {
  public static canTransition(from: ScheduleStatusValue, to: ScheduleStatusValue): boolean {
    if (from === to) return true;
    return TRANSICTIONS[from].has(to);
  }

  public static assertCanTransition(from: ScheduleStatusValue, to: ScheduleStatusValue): void {
    if (!this.canTransition(from, to)) {
      throw new ConflictError(`Invalid schedule status transition: ${from} -> ${to}`);
    }
  }
}

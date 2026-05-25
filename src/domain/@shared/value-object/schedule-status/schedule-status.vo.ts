import { InvalidValueError } from '../../errors/invalidValueError.js';
import { ValueObject } from '../value-object.abstract.js';

export type ScheduleStatusValue = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const ALLOWED: ReadonlySet<ScheduleStatusValue> = new Set([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

export class ScheduleStatus extends ValueObject<ScheduleStatusValue> {
  constructor(value: string) {
    const normalised = value.trim().toLowerCase();
    if (!ALLOWED.has(normalised as ScheduleStatusValue)) {
      throw new InvalidValueError(`Invalid schedule status: ${value}`);
    }
    super(normalised as ScheduleStatusValue);
  }
}

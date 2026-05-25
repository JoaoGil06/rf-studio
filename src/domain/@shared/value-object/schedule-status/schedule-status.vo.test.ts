import { describe, it, expect } from 'vitest';
import { ScheduleStatus } from './schedule-status.vo.js';
import { InvalidValueError } from '../../errors/invalidValueError.js';

describe('ScheduleStatus', () => {
  it.each(['pending', 'confirmed', 'completed', 'cancelled'])('accepts "%s"', (value) => {
    expect(new ScheduleStatus(value).value).toBe(value);
  });

  it('normalises case and whitespace', () => {
    expect(new ScheduleStatus('  PENDING  ').value).toBe('pending');
  });

  it('throws InvalidValueError for anything else', () => {
    expect(() => new ScheduleStatus('done')).toThrow(InvalidValueError);
    expect(() => new ScheduleStatus('')).toThrow(InvalidValueError);
  });

  it('equals compares by value', () => {
    expect(new ScheduleStatus('pending').equals(new ScheduleStatus('pending'))).toBe(true);
    expect(new ScheduleStatus('pending').equals(new ScheduleStatus('confirmed'))).toBe(false);
  });
});

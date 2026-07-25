import { describe, it, expect } from 'vitest';
import { ScheduleRangeService } from './schedule-range.service.js';
import { InvalidValueError } from '../../@shared/errors/invalidValueError.js';

describe('ScheduleRangeService', () => {
  it('computes a year range as [year-01-01, next-year-01-01)', () => {
    const { from, to } = ScheduleRangeService.computeRange({ year: 2026 });
    expect(from.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('computes a month range as [year-month-01, next-month-01)', () => {
    const { from, to } = ScheduleRangeService.computeRange({ year: 2026, month: 6 });
    expect(from.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2026-07-01T00:00:00.000Z');
  });

  it('rolls over from December into the next year for month=12', () => {
    const { from, to } = ScheduleRangeService.computeRange({ year: 2026, month: 12 });
    expect(from.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('computes a week range as [weekStart, weekStart + 7 days)', () => {
    const { from, to } = ScheduleRangeService.computeRange({
      weekStart: new Date('2026-06-01T00:00:00Z'),
    });
    expect(from.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2026-06-08T00:00:00.000Z');
  });

  it('throws InvalidValueError when no recognised mode is provided', () => {
    expect(() => ScheduleRangeService.computeRange({})).toThrow(InvalidValueError);
  });

  it('throws InvalidValueError when month is given without year', () => {
    expect(() => ScheduleRangeService.computeRange({ month: 6 })).toThrow(InvalidValueError);
  });
});

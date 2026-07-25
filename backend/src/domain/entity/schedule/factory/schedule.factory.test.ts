import { describe, it, expect } from 'vitest';
import { ScheduleFactory } from './schedule.factory.js';
import { InvalidValueError } from '../../../@shared/errors/invalidValueError.js';

describe('ScheduleFactory', () => {
  const baseProps = {
    userId: '11111111-1111-1111-1111-111111111111',
    serviceId: '22222222-2222-2222-2222-222222222222',
    date: new Date('2026-06-01T10:00:00Z'),
  };

  it('create() generates a new UUID', () => {
    const schedule = ScheduleFactory.create(baseProps);
    expect(schedule.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('create() defaults status to "pending" when omitted', () => {
    const schedule = ScheduleFactory.create(baseProps);
    expect(schedule.status.value).toBe('pending');
  });

  it('create() respects explicit status', () => {
    const schedule = ScheduleFactory.create({ ...baseProps, status: 'confirmed' });
    expect(schedule.status.value).toBe('confirmed');
  });

  it('create() defaults photoUrl to null when omitted', () => {
    const schedule = ScheduleFactory.create(baseProps);
    expect(schedule.photoUrl).toBeNull();
  });

  it('create() defaults tip to null', () => {
    const schedule = ScheduleFactory.create(baseProps);
    expect(schedule.tip).toBeNull();
  });

  it('throws InvalidValueError for an invalid date', () => {
    expect(() => ScheduleFactory.create({ ...baseProps, date: new Date('not-a-date') })).toThrow(
      InvalidValueError,
    );
  });

  it('reconstitute() preserves the provided id, status, and timestamps', () => {
    const id = '33333333-3333-3333-3333-333333333333';
    const now = new Date('2026-01-01T00:00:00Z');
    const schedule = ScheduleFactory.reconstitute({
      ...baseProps,
      id,
      status: 'confirmed',
      photoUrl: null,
      tip: 12.5,
      createdAt: now,
      updatedAt: now,
    });
    expect(schedule.id).toBe(id);
    expect(schedule.status.value).toBe('confirmed');
    expect(schedule.createdAt).toEqual(now);
  });
});

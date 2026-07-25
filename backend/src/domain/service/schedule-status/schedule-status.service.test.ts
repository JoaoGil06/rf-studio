import { describe, it, expect } from 'vitest';
import { ScheduleStatusService } from './schedule-status.service.js';
import { ConflictError } from '../../@shared/errors/conflictError.js';

describe('ScheduleStatusService', () => {
  it('allows pending -> confirmed and pending -> cancelled', () => {
    expect(ScheduleStatusService.canTransition('pending', 'confirmed')).toBe(true);
    expect(ScheduleStatusService.canTransition('pending', 'cancelled')).toBe(true);
  });

  it('allows confirmed -> completed and confirmed -> cancelled', () => {
    expect(ScheduleStatusService.canTransition('confirmed', 'completed')).toBe(true);
    expect(ScheduleStatusService.canTransition('confirmed', 'cancelled')).toBe(true);
  });

  it('rejects pending -> completed (must confirm first)', () => {
    expect(ScheduleStatusService.canTransition('pending', 'completed')).toBe(false);
  });

  it('treats completed and cancelled as terminal', () => {
    expect(ScheduleStatusService.canTransition('completed', 'cancelled')).toBe(false);
    expect(ScheduleStatusService.canTransition('cancelled', 'confirmed')).toBe(false);
  });

  it('assertCanTransition throws ConflictError on an illegal transition', () => {
    expect(() => ScheduleStatusService.assertCanTransition('completed', 'pending')).toThrow(
      ConflictError,
    );
  });

  it('assertCanTransition is a no-op for same-status', () => {
    expect(() => ScheduleStatusService.assertCanTransition('pending', 'pending')).not.toThrow();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleConflictService } from './schedule-conflict.service.js';
import type { IScheduleRepository } from '../../repository/schedule-repository.interface.js';
import type { Schedule } from '../../entity/schedule/schedule.entity.js';

const mockRepo: IScheduleRepository = {
  save: vi.fn(),
  findOverlapping: vi.fn(),
};

describe('ScheduleConflictService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns false when no overlapping schedules exist', async () => {
    vi.mocked(mockRepo.findOverlapping).mockResolvedValue([]);

    const result = await ScheduleConflictService.hasConflict(
      new Date('2026-06-01T10:00:00Z'),
      45,
      mockRepo,
    );

    expect(result).toBe(false);
    expect(mockRepo.findOverlapping).toHaveBeenCalledWith(
      new Date('2026-06-01T10:00:00Z'),
      new Date('2026-06-01T10:45:00Z'),
    );
  });

  it('returns true when the repository finds at least one overlap', async () => {
    vi.mocked(mockRepo.findOverlapping).mockResolvedValue([{} as Schedule]);

    const result = await ScheduleConflictService.hasConflict(
      new Date('2026-06-01T10:00:00Z'),
      30,
      mockRepo,
    );

    expect(result).toBe(true);
  });
});

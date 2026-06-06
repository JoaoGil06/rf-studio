import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetScheduleUseCase } from './get-schedule.usecase.js';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';

const makeSchedule = () =>
  ScheduleFactory.reconstitute({
    id: 'sch-1',
    userId: 'usr-1',
    serviceId: 'svc-1',
    status: 'pending',
    date: new Date('2026-06-01T10:00:00Z'),
    photoUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const mockRepo: IScheduleRepository = {
  save: vi.fn(),
  findOverlapping: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  findInRange: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  complete: vi.fn(),
};

describe('GetScheduleUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the schedule when found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeSchedule());
    const usecase = new GetScheduleUseCase(mockRepo);

    const result = await usecase.execute({ id: 'sch-1' });

    expect(result.id).toBe('sch-1');
    expect(result.userId).toBe('usr-1');
    expect(result.serviceId).toBe('svc-1');
    expect(result.status).toBe('pending');
    expect(result.date).toBe('2026-06-01T10:00:00.000Z');
    expect(result.photoUrl).toBeNull();
  });

  it('throws EntityNotFoundError when the schedule does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new GetScheduleUseCase(mockRepo);

    await expect(usecase.execute({ id: 'missing' })).rejects.toThrow(EntityNotFoundError);
  });

  it('calls findById with the provided id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeSchedule());
    const usecase = new GetScheduleUseCase(mockRepo);
    await usecase.execute({ id: 'sch-1' });

    expect(mockRepo.findById).toHaveBeenCalledWith('sch-1');
  });
});

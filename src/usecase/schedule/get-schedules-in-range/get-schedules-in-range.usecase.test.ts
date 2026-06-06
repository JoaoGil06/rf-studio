import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSchedulesInRangeUseCase } from './get-schedules-in-range.usecase.js';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';

const makeSchedule = (day: number) =>
  ScheduleFactory.reconstitute({
    id: `sch-${day}`,
    userId: 'usr-1',
    serviceId: 'svc-1',
    status: 'pending',
    date: new Date(`2026-06-0${day}T10:00:00Z`),
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

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

describe('GetSchedulesInRangeUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  const buildUsecase = () => new GetSchedulesInRangeUseCase(mockRepo, mockValidation);

  it('queries the repo with a year window when only year is given', async () => {
    vi.mocked(mockRepo.findInRange).mockResolvedValue([makeSchedule(1)]);

    const result = await buildUsecase().execute({ filter: { year: 2026 } });

    expect(mockRepo.findInRange).toHaveBeenCalledWith({
      from: new Date('2026-01-01T00:00:00Z'),
      to: new Date('2027-01-01T00:00:00Z'),
      userId: undefined,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('sch-1');
  });

  it('queries the repo with a month window when year + month are given', async () => {
    vi.mocked(mockRepo.findInRange).mockResolvedValue([]);

    await buildUsecase().execute({ filter: { year: 2026, month: 6 } });

    expect(mockRepo.findInRange).toHaveBeenCalledWith({
      from: new Date('2026-06-01T00:00:00Z'),
      to: new Date('2026-07-01T00:00:00Z'),
      userId: undefined,
    });
  });

  it('queries the repo with a 7-day week window when weekStart is given', async () => {
    vi.mocked(mockRepo.findInRange).mockResolvedValue([]);

    await buildUsecase().execute({
      filter: { weekStart: new Date('2026-06-01T00:00:00Z') },
    });

    expect(mockRepo.findInRange).toHaveBeenCalledWith({
      from: new Date('2026-06-01T00:00:00Z'),
      to: new Date('2026-06-08T00:00:00Z'),
      userId: undefined,
    });
  });

  it('forwards filter.userId to the repository', async () => {
    vi.mocked(mockRepo.findInRange).mockResolvedValue([]);

    await buildUsecase().execute({ filter: { year: 2026, userId: 'usr-9' } });

    expect(mockRepo.findInRange).toHaveBeenCalledWith({
      from: new Date('2026-01-01T00:00:00Z'),
      to: new Date('2027-01-01T00:00:00Z'),
      userId: 'usr-9',
    });
  });

  it('propagates InvalidValueError when the validator rejects the filter', async () => {
    vi.mocked(mockValidation.validate).mockImplementation(() => {
      throw new InvalidValueError('bad filter');
    });

    await expect(buildUsecase().execute({ filter: {} })).rejects.toThrow(InvalidValueError);
  });
});

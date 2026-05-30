import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { DeleteScheduleUseCase } from './delete-schedule.usecase.js';

const SCH_ID = '11111111-1111-1111-1111-111111111111';

const makeSchedule = () =>
  ScheduleFactory.reconstitute({
    id: SCH_ID,
    userId: '44444444-4444-4444-4444-444444444444',
    serviceId: '22222222-2222-2222-2222-222222222222',
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
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

describe('DeleteScheduleUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the schedule and returns its id', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeSchedule());
    const usecase = new DeleteScheduleUseCase(mockRepo, mockValidation);

    const result = await usecase.execute({ id: SCH_ID });

    expect(result).toEqual({ id: SCH_ID });
    expect(mockRepo.delete).toHaveBeenCalledWith(SCH_ID);
    expect(mockRepo.delete).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError when the schedule does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const usecase = new DeleteScheduleUseCase(mockRepo, mockValidation);

    await expect(usecase.execute({ id: SCH_ID })).rejects.toThrow(EntityNotFoundError);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('validates input before touching the repository', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeSchedule());
    const usecase = new DeleteScheduleUseCase(mockRepo, mockValidation);

    await usecase.execute({ id: SCH_ID });

    expect(mockValidation.validate).toHaveBeenCalledOnce();
  });
});

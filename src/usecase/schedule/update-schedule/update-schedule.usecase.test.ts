import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateScheduleUseCase } from './update-schedule.usecase.js';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';

const SCH_ID = '11111111-1111-1111-1111-111111111111';
const SVC_ID = '22222222-2222-2222-2222-222222222222';
const NEW_SVC_ID = '33333333-3333-3333-3333-333333333333';

const makeSchedule = () =>
  ScheduleFactory.reconstitute({
    id: SCH_ID,
    userId: '44444444-4444-4444-4444-444444444444',
    serviceId: SVC_ID,
    status: 'pending',
    date: new Date('2026-06-01T10:00:00Z'),
    photoUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const mockScheduleRepo: IScheduleRepository = {
  save: vi.fn(),
  findOverlapping: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  findInRange: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockServiceRepo: IServiceRepository = {
  findByNameAndCategory: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const buildUsecase = () =>
  new UpdateScheduleUseCase(mockScheduleRepo, mockServiceRepo, mockValidation);

describe('UpdateScheduleUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates status only and persists, skipping the conflict check', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule());

    const result = await buildUsecase().execute({ id: SCH_ID, status: 'confirmed' });

    expect(result.status).toBe('confirmed');
    expect(mockScheduleRepo.update).toHaveBeenCalledOnce();
    expect(mockServiceRepo.findById).not.toHaveBeenCalled();
    expect(mockScheduleRepo.findOverlapping).not.toHaveBeenCalled();
  });

  it('throws EntityNotFoundError (schedule) when the schedule does not exist', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(null);

    await expect(buildUsecase().execute({ id: SCH_ID, status: 'confirmed' })).rejects.toThrow(
      EntityNotFoundError,
    );
    expect(mockScheduleRepo.update).not.toHaveBeenCalled();
  });

  it('re-checks conflicts excluding self when the date changes', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule());
    vi.mocked(mockServiceRepo.findById).mockResolvedValue({
      id: SVC_ID,
      durationMinutes: 45,
    } as never);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);

    const newDate = new Date('2026-06-02T12:00:00Z');
    const result = await buildUsecase().execute({ id: SCH_ID, date: newDate });

    expect(mockServiceRepo.findById).toHaveBeenCalledWith(SVC_ID);
    expect(mockScheduleRepo.findOverlapping).toHaveBeenCalledWith(
      newDate,
      new Date(newDate.getTime() + 45 * 60_000),
      SCH_ID,
    );
    expect(result.date).toBe(newDate.toISOString());
    expect(mockScheduleRepo.update).toHaveBeenCalledOnce();
  });

  it('uses the new serviceId duration when the service changes', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule());
    vi.mocked(mockServiceRepo.findById).mockResolvedValue({
      id: NEW_SVC_ID,
      durationMinutes: 60,
    } as never);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);

    const result = await buildUsecase().execute({ id: SCH_ID, serviceId: NEW_SVC_ID });

    expect(mockServiceRepo.findById).toHaveBeenCalledWith(NEW_SVC_ID);
    expect(result.serviceId).toBe(NEW_SVC_ID);
    expect(mockScheduleRepo.update).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError (service) when the new serviceId does not exist', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule());
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(null);

    await expect(buildUsecase().execute({ id: SCH_ID, serviceId: NEW_SVC_ID })).rejects.toThrow(
      EntityNotFoundError,
    );
    expect(mockScheduleRepo.update).not.toHaveBeenCalled();
  });

  it('throws ConflictError when the new slot overlaps another schedule', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule());
    vi.mocked(mockServiceRepo.findById).mockResolvedValue({
      id: SVC_ID,
      durationMinutes: 45,
    } as never);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([{} as never]);

    await expect(
      buildUsecase().execute({ id: SCH_ID, date: new Date('2026-06-02T12:00:00Z') }),
    ).rejects.toThrow(ConflictError);
    expect(mockScheduleRepo.update).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterScheduleUseCase } from './register-schedule.usecase.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import type { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import type { IScheduleDiscountRepository } from '../../../domain/repository/schedule-discount-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { DiscountService } from '../../../domain/service/discount/discount.service.js';

const userId = '11111111-1111-1111-1111-111111111111';
const serviceId = '22222222-2222-2222-2222-222222222222';

const userStub = { id: userId, birthDate: null } as never;
const birthdayUserStub = { id: userId, birthDate: new Date('1990-06-15T00:00:00Z') } as never;
const serviceStub = { id: serviceId, durationMinutes: 45 } as never;

const mockUserRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findRoleIdByName: vi.fn(),
  save: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} satisfies IUserRepository;

const mockServiceRepo = {
  findById: vi.fn(),
  findByNameAndCategory: vi.fn(),
  save: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} satisfies IServiceRepository;

const mockScheduleRepo = {
  save: vi.fn(),
  findOverlapping: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  findInRange: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  complete: vi.fn(),
  countCompletedForLoyalty: vi.fn(),
} satisfies IScheduleRepository;

const mockScheduleDiscountRepo = {
  save: vi.fn(),
  countByUserAndReason: vi.fn(),
} satisfies IScheduleDiscountRepository;

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const input = {
  userId,
  serviceId,
  date: new Date('2026-06-01T10:00:00Z'),
};

describe('RegisterScheduleUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // No discount by default; individual cases override these counts.
    vi.mocked(mockScheduleRepo.countCompletedForLoyalty).mockResolvedValue(0);
    vi.mocked(mockScheduleDiscountRepo.countByUserAndReason).mockResolvedValue(0);
  });

  const buildUsecase = () =>
    new RegisterScheduleUseCase(
      mockScheduleRepo,
      mockUserRepo,
      mockScheduleDiscountRepo,
      mockServiceRepo,
      mockValidation,
      new DiscountService(),
    );

  it('registers a schedule and returns the output DTO', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(userStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(serviceStub);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);

    const result = await buildUsecase().execute(input);

    expect(result.userId).toBe(userId);
    expect(result.serviceId).toBe(serviceId);
    expect(result.status).toBe('pending');
    expect(result.photoUrl).toBeNull();
    expect(result.id).toMatch(/[0-9a-f-]{36}/);
    expect(mockScheduleRepo.save).toHaveBeenCalledOnce();
  });

  it('throws EntityNotFoundError when the user does not exist', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

    await expect(buildUsecase().execute(input)).rejects.toThrow(EntityNotFoundError);
  });

  it('throws EntityNotFoundError when the service does not exist', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(userStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(null);

    await expect(buildUsecase().execute(input)).rejects.toThrow(EntityNotFoundError);
  });

  it('throws ConflictError when the time slot overlaps an existing schedule', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(userStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(serviceStub);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([{} as never]);

    await expect(buildUsecase().execute(input)).rejects.toThrow(ConflictError);
  });

  it('grants a loyalty discount when the client completed a fresh cycle', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(userStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(serviceStub);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);
    vi.mocked(mockScheduleRepo.countCompletedForLoyalty).mockResolvedValue(9);
    vi.mocked(mockScheduleDiscountRepo.countByUserAndReason).mockResolvedValue(0);

    await buildUsecase().execute(input);

    expect(mockScheduleDiscountRepo.save).toHaveBeenCalledOnce();
    expect(mockScheduleDiscountRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'loyalty', percentage: 30 }),
    );
  });

  it('grants a birthday discount when the booking month matches the birth month', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(birthdayUserStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(serviceStub);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);

    await buildUsecase().execute(input);

    expect(mockScheduleDiscountRepo.save).toHaveBeenCalledOnce();
    expect(mockScheduleDiscountRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'birthday', percentage: 10 }),
    );
  });

  it('applies only the loyalty discount when both rules qualify', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(birthdayUserStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(serviceStub);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);
    vi.mocked(mockScheduleRepo.countCompletedForLoyalty).mockResolvedValue(9);
    vi.mocked(mockScheduleDiscountRepo.countByUserAndReason).mockResolvedValue(0);

    await buildUsecase().execute(input);

    expect(mockScheduleDiscountRepo.save).toHaveBeenCalledOnce();
    expect(mockScheduleDiscountRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'loyalty', percentage: 30 }),
    );
  });

  it('does not persist a discount when no rule qualifies', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(userStub);
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(serviceStub);
    vi.mocked(mockScheduleRepo.findOverlapping).mockResolvedValue([]);

    await buildUsecase().execute(input);

    expect(mockScheduleDiscountRepo.save).not.toHaveBeenCalled();
  });
});

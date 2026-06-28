import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompleteScheduleUseCase } from './complete-schedule.usecase.js';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import type { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import type { IProductRepository } from '../../../domain/repository/product-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';
import { ServiceFactory } from '../../../domain/entity/service/factory/service.factory.js';
import { ProductFactory } from '../../../domain/entity/product/factory/product.factory.js';
import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { InvalidValueError } from '../../../domain/@shared/errors/invalidValueError.js';

const SCH_ID = '11111111-1111-1111-1111-111111111111';
const SVC_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = '44444444-4444-4444-4444-444444444444';
const PROD_ID_1 = '55555555-5555-5555-5555-555555555555';
const PROD_ID_2 = '66666666-6666-6666-6666-666666666666';

const makeSchedule = (status = 'confirmed') =>
  ScheduleFactory.reconstitute({
    id: SCH_ID,
    userId: USER_ID,
    serviceId: SVC_ID,
    status,
    date: new Date('2026-06-01T10:00:00Z'),
    photoUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const makeService = (category = 'nails') =>
  ServiceFactory.reconstitute({
    id: SVC_ID,
    name: 'Gel manicure',
    category,
    price: 30,
    durationMinutes: 45,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const makeProduct = (id: string, category = 'nails') =>
  ProductFactory.reconstitute({
    id,
    name: 'Top coat',
    brand: 'Acme',
    category,
    color: null,
    isAvailable: true,
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
  complete: vi.fn(),
  countCompletedForLoyalty: vi.fn(),
};

const mockServiceRepo: IServiceRepository = {
  findByNameAndCategory: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockProductRepo: IProductRepository = {
  findByNameAndBrand: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  findByIds: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockValidation: IValidationAdapter = {
  validate: vi.fn().mockImplementation((_, data) => data),
};

const buildUsecase = () =>
  new CompleteScheduleUseCase(mockScheduleRepo, mockServiceRepo, mockProductRepo, mockValidation);

describe('CompleteScheduleUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('completes a confirmed schedule and persists it with the products', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule('confirmed'));
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(makeService('nails'));
    vi.mocked(mockProductRepo.findByIds).mockResolvedValue([
      makeProduct(PROD_ID_1, 'nails'),
      makeProduct(PROD_ID_2, 'nails'),
    ]);

    const result = await buildUsecase().execute({
      scheduleId: SCH_ID,
      productIds: [PROD_ID_1, PROD_ID_2],
    });

    expect(result.id).toBe(SCH_ID);
    expect(result.status).toBe('completed');
    expect(mockScheduleRepo.complete).toHaveBeenCalledOnce();
    expect(mockScheduleRepo.complete).toHaveBeenCalledWith(expect.anything(), [
      PROD_ID_1,
      PROD_ID_2,
    ]);
  });

  it('de-duplicates productIds before lookup and persistence', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule('confirmed'));
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(makeService('nails'));
    vi.mocked(mockProductRepo.findByIds).mockResolvedValue([makeProduct(PROD_ID_1, 'nails')]);

    await buildUsecase().execute({
      scheduleId: SCH_ID,
      productIds: [PROD_ID_1, PROD_ID_1],
    });

    expect(mockProductRepo.findByIds).toHaveBeenCalledWith([PROD_ID_1]);
    expect(mockScheduleRepo.complete).toHaveBeenCalledWith(expect.anything(), [PROD_ID_1]);
  });

  it('throws EntityNotFoundError when the schedule does not exist', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(null);

    await expect(
      buildUsecase().execute({ scheduleId: SCH_ID, productIds: [PROD_ID_1] }),
    ).rejects.toThrow(EntityNotFoundError);
    expect(mockScheduleRepo.complete).not.toHaveBeenCalled();
  });

  it('throws ConflictError when the schedule cannot transition to completed', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule('pending'));

    await expect(
      buildUsecase().execute({ scheduleId: SCH_ID, productIds: [PROD_ID_1] }),
    ).rejects.toThrow(ConflictError);
    expect(mockServiceRepo.findById).not.toHaveBeenCalled();
    expect(mockScheduleRepo.complete).not.toHaveBeenCalled();
  });

  it('throws EntityNotFoundError when the service does not exist', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule('confirmed'));
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(null);

    await expect(
      buildUsecase().execute({ scheduleId: SCH_ID, productIds: [PROD_ID_1] }),
    ).rejects.toThrow(EntityNotFoundError);
    expect(mockProductRepo.findByIds).not.toHaveBeenCalled();
    expect(mockScheduleRepo.complete).not.toHaveBeenCalled();
  });

  it('throws EntityNotFoundError when a product is missing', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule('confirmed'));
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(makeService('nails'));
    vi.mocked(mockProductRepo.findByIds).mockResolvedValue([makeProduct(PROD_ID_1, 'nails')]);

    await expect(
      buildUsecase().execute({ scheduleId: SCH_ID, productIds: [PROD_ID_1, PROD_ID_2] }),
    ).rejects.toThrow(EntityNotFoundError);
    expect(mockScheduleRepo.complete).not.toHaveBeenCalled();
  });

  it('throws InvalidValueError when a product category does not match the service', async () => {
    vi.mocked(mockScheduleRepo.findById).mockResolvedValue(makeSchedule('confirmed'));
    vi.mocked(mockServiceRepo.findById).mockResolvedValue(makeService('nails'));
    vi.mocked(mockProductRepo.findByIds).mockResolvedValue([makeProduct(PROD_ID_1, 'eyebrows')]);

    await expect(
      buildUsecase().execute({ scheduleId: SCH_ID, productIds: [PROD_ID_1] }),
    ).rejects.toThrow(InvalidValueError);
    expect(mockScheduleRepo.complete).not.toHaveBeenCalled();
  });
});

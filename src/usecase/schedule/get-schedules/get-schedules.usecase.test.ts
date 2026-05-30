import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSchedulesUseCase } from './get-schedules.usecase.js';
import { encodeCursor } from '../../shared/cursor.js';
import type { IScheduleRepository } from '../../../domain/repository/schedule-repository.interface.js';
import { ScheduleFactory } from '../../../domain/entity/schedule/factory/schedule.factory.js';

const makeSchedule = (i: number) =>
  ScheduleFactory.reconstitute({
    id: `sch-${i}`,
    userId: 'usr-1',
    serviceId: 'svc-1',
    status: 'pending',
    date: new Date(`2026-06-0${i}T10:00:00Z`),
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

describe('GetSchedulesUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty connection when no schedules exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    const result = await usecase.execute({});

    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.pageInfo.hasPreviousPage).toBe(false);
    expect(result.pageInfo.startCursor).toBeNull();
    expect(result.pageInfo.endCursor).toBeNull();
  });

  it('returns edges with opaque cursors and mapped node fields', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeSchedule(1)]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node.id).toBe('sch-1');
    expect(result.edges[0].node.userId).toBe('usr-1');
    expect(result.edges[0].node.status).toBe('pending');
    expect(result.edges[0].cursor).toBeDefined();
  });

  it('sets hasNextPage true when more results exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeSchedule(1), makeSchedule(2)]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    const result = await usecase.execute({ first: 1 });

    expect(result.edges).toHaveLength(1);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('sets hasPreviousPage true when an after cursor is provided', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([makeSchedule(1)]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    const result = await usecase.execute({ after: encodeCursor(5) });

    expect(result.pageInfo.hasPreviousPage).toBe(true);
  });

  it('passes the correct offset to the repository when after is given', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    await usecase.execute({ first: 10, after: encodeCursor(4) });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 11, offset: 5, userId: undefined });
  });

  it('caps first at MAX_PAGE_SIZE (100)', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    await usecase.execute({ first: 9999 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 101, offset: 0, userId: undefined });
  });

  it('forwards filter.userId to the repository', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const usecase = new GetSchedulesUseCase(mockRepo);
    await usecase.execute({ filter: { userId: 'usr-1' }, first: 5 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 6, offset: 0, userId: 'usr-1' });
  });
});

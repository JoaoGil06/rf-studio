import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Schedule } from '../../domain/entity/schedule/schedule.entity.js';
import {
  IScheduleRepository,
  ScheduleListParams,
  ScheduleRangeParams,
} from '../../domain/repository/schedule-repository.interface.js';
import { schedules } from '../db/schema/schedules.schema.js';
import { services } from '../db/schema/services.schema.js';
import { and, sql, eq, asc, gte, lt, ne } from 'drizzle-orm';
import { ScheduleFactory } from '../../domain/entity/schedule/factory/schedule.factory.js';

export class ScheduleRepository implements IScheduleRepository {
  private readonly db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  async save(schedule: Schedule): Promise<void> {
    await this.db.insert(schedules).values({
      id: schedule.id,
      userId: schedule.userId,
      serviceId: schedule.serviceId,
      status: schedule.status.value,
      date: schedule.date,
      photoUrl: schedule.photoUrl,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    });
  }

  async findOverlapping(start: Date, end: Date, excludeId?: string): Promise<Schedule[]> {
    const conditions = [
      sql`${schedules.date} < ${end}`,
      sql`${schedules.date} + (${services.durationMinutes} * INTERVAL '1 minute') > ${start}`,
    ];

    if (excludeId) {
      conditions.push(ne(schedules.id, excludeId));
    }

    const rows = await this.db
      .select({
        id: schedules.id,
        userId: schedules.userId,
        serviceId: schedules.serviceId,
        status: schedules.status,
        date: schedules.date,
        photoUrl: schedules.photoUrl,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        durationMinutes: services.durationMinutes,
      })
      .from(schedules)
      .innerJoin(services, eq(schedules.serviceId, services.id))
      .where(and(...conditions));

    return rows.map((row) =>
      ScheduleFactory.reconstitute({
        id: row.id,
        userId: row.userId,
        serviceId: row.serviceId,
        status: row.status,
        date: row.date,
        photoUrl: row.photoUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<Schedule | null> {
    const rows = await this.db.select().from(schedules).where(eq(schedules.id, id)).limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];

    return ScheduleFactory.reconstitute({
      id: row.id,
      userId: row.userId,
      serviceId: row.serviceId,
      status: row.status,
      date: row.date,
      photoUrl: row.photoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findAll(params: ScheduleListParams): Promise<Schedule[]> {
    const filter = params.userId ? eq(schedules.userId, params.userId) : undefined;

    const rows = await this.db
      .select()
      .from(schedules)
      .where(filter)
      .orderBy(asc(schedules.date), asc(schedules.id))
      .limit(params.limit)
      .offset(params.offset);

    return rows.map((row) =>
      ScheduleFactory.reconstitute({
        id: row.id,
        userId: row.userId,
        serviceId: row.serviceId,
        status: row.status,
        date: row.date,
        photoUrl: row.photoUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async findInRange(params: ScheduleRangeParams): Promise<Schedule[]> {
    // GTE -> greater than or equal → >= | Que o from, seja maior ou igual à date
    // LT -> less than | Que o to, seja menor que o schedules.date
    const conditions = [gte(schedules.date, params.from), lt(schedules.date, params.to)];

    if (params.userId) {
      conditions.push(eq(schedules.userId, params.userId));
    }

    const rows = await this.db
      .select()
      .from(schedules)
      .where(and(...conditions))
      .orderBy(asc(schedules.date), asc(schedules.id));

    return rows.map((row) =>
      ScheduleFactory.reconstitute({
        id: row.id,
        userId: row.userId,
        serviceId: row.serviceId,
        status: row.status,
        date: row.date,
        photoUrl: row.photoUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async update(schedule: Schedule): Promise<void> {
    await this.db
      .update(schedules)
      .set({
        serviceId: schedule.serviceId,
        status: schedule.status.value,
        date: schedule.date,
        updatedAt: schedule.updatedAt,
      })
      .where(eq(schedules.id, schedule.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schedules).where(eq(schedules.id, id));
  }
}

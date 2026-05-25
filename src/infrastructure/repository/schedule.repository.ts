import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Schedule } from '../../domain/entity/schedule/schedule.entity.js';
import { IScheduleRepository } from '../../domain/repository/schedule-repository.interface.js';
import { schedules } from '../db/schema/schedules.schema.js';
import { services } from '../db/schema/services.schema.js';
import { and, sql, eq } from 'drizzle-orm';
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

  async findOverlapping(start: Date, end: Date): Promise<Schedule[]> {
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
      .where(
        and(
          sql`${schedules.date} < ${end}`,
          sql`${schedules.date} + (${services.durationMinutes} * INTERVAL '1 minute') > ${start}`,
        ),
      );

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
}

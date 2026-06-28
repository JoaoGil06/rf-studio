import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { scheduleDiscounts } from '../db/schema/schedule-discounts.schema.js';
import {
  IScheduleDiscountRepository,
  SaveScheduleDiscountInput,
} from '../../domain/repository/schedule-discount-repository.interface.js';
import { DiscountReason } from '../../domain/service/discount/discount-rule.interface.js';

export class ScheduleDiscountRepository implements IScheduleDiscountRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async save(input: SaveScheduleDiscountInput): Promise<void> {
    await this.db.insert(scheduleDiscounts).values({
      scheduleId: input.scheduleId,
      userId: input.userId,
      reason: input.reason,
      percentage: input.percentage.toString(), // numeric column expects string
    });
  }

  async countByUserAndReason(userId: string, reason: DiscountReason): Promise<number> {
    const rows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(scheduleDiscounts)
      .where(and(eq(scheduleDiscounts.userId, userId), eq(scheduleDiscounts.reason, reason)));

    const row = rows[0];

    return Number(row?.count ?? 0);
  }
}

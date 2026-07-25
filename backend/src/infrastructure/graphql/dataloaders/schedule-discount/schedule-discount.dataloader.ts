import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { scheduleDiscounts } from '../../../db/schema/schedule-discounts.schema.js';
import { ScheduleDiscountDto } from './schedule-discount.dataloader.dto.js';

export function createScheduleDiscountDataLoader(
  db: NodePgDatabase,
): DataLoader<string, ScheduleDiscountDto | null> {
  return new DataLoader<string, ScheduleDiscountDto | null>(async (scheduleIds) => {
    const rows = await db
      .select({
        scheduleId: scheduleDiscounts.scheduleId,
        reason: scheduleDiscounts.reason,
        percentage: scheduleDiscounts.percentage,
      })
      .from(scheduleDiscounts)
      .where(inArray(scheduleDiscounts.scheduleId, [...scheduleIds]));

    const map = new Map(
      rows.map((r) => [r.scheduleId, { reason: r.reason, percentage: Number(r.percentage) }]),
    );
    return scheduleIds.map((id) => map.get(id) ?? null);
  });
}

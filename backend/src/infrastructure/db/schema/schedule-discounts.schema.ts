import { pgEnum, pgTable, uuid, numeric, timestamp, unique } from 'drizzle-orm/pg-core';
import { schedules } from './schedules.schema.js';
import { users } from './users.schema.js';

export const discountReasonEnum = pgEnum('discount_reason', ['loyalty', 'birthday']);

export const scheduleDiscounts = pgTable(
  'schedule_discounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scheduleId: uuid('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    reason: discountReasonEnum('reason').notNull(),
    percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({ uniqueScheduleDiscount: unique().on(t.scheduleId) }),
);

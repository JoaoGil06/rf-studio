import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { schedules } from './schedules.schema.js';
import { products } from './products.schema.js';

export const scheduleProducts = pgTable(
  'schedule_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scheduleId: uuid('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({ uniqueScheduleProduct: unique().on(t.scheduleId, t.productId) }),
);

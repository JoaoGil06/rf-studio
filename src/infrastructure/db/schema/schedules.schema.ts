import { pgEnum, pgTable, uuid, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { services } from './services.schema.js';

export const scheduleStatusEnum = pgEnum('schedule_status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

export const schedules = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => services.id),
  status: scheduleStatusEnum('status').notNull().default('pending'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  photoUrl: varchar('photo_url', { length: 500 }),
  tip: numeric('tip', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

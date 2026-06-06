import { pgTable, uuid, varchar, decimal, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const serviceCategoryEnum = pgEnum('service_category', ['nails', 'eyebrows']);

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  category: serviceCategoryEnum('category').notNull().default('nails'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

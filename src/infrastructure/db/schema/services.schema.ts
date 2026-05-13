import { pgTable, uuid, varchar, decimal, integer, timestamp } from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 20 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

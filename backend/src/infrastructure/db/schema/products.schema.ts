import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { serviceCategoryEnum } from './services.schema.js';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  color: varchar('color', { length: 50 }),
  category: serviceCategoryEnum('category').notNull().default('nails'),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

import { pgTable, uuid, varchar, timestamp, date } from 'drizzle-orm/pg-core';
import { roles } from './roles.schema.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role_id: uuid('role_id')
    .notNull()
    .references(() => roles.id),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  phone_number: varchar('phone_number', { length: 20 }).notNull(),
  birth_date: date('birth_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

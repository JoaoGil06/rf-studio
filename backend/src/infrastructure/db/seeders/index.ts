import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { roles } from '../schema/roles.schema.js';
import { DATABASE_URL } from '../../constants/env.js';

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log('Seeding Roles to Database ...');
  await db
    .insert(roles)
    .values([{ name: 'manager' }, { name: 'client' }])
    .onConflictDoNothing();
  console.log('Done.');
  await pool.end();
}

seed().catch((error) => {
  console.log('[Error during seeding]: ', error);
  process.exit(1);
});

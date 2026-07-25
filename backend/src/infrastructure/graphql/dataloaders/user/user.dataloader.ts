import DataLoader from 'dataloader';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UserDataLoaderDto } from './user.dataloader.dto.js';
import { users } from '../../../db/schema/users.schema.js';
import { inArray } from 'drizzle-orm';

export function createUserDataLoader(
  db: NodePgDatabase,
): DataLoader<string, UserDataLoaderDto | null> {
  return new DataLoader<string, UserDataLoaderDto | null>(async (ids) => {
    const rows = await db
      .select({
        id: users.id,
        roleId: users.role_id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phone_number,
        birthDate: users.birth_date,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.id, [...ids]));

    const usersHashMap = new Map<string, UserDataLoaderDto>();

    for (const row of rows) {
      usersHashMap.set(row.id, {
        id: row.id,
        roleId: row.roleId,
        name: row.name,
        email: row.email,
        phoneNumber: row.phoneNumber,
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split('T')[0] : null,
        createdAt: row.createdAt.toISOString(),
      });
    }

    return ids.map((id) => usersHashMap.get(id) ?? null);
  });
}

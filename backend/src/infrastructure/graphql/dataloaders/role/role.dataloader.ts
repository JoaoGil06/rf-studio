import DataLoader from 'dataloader';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RoleDto } from './role.dataloader.dto.js';
import { roles } from '../../../db/schema/roles.schema.js';
import { inArray } from 'drizzle-orm';

export function createRoleDataLoader(db: NodePgDatabase): DataLoader<string, RoleDto | null> {
  return new DataLoader<string, RoleDto | null>(async (ids) => {
    const rows = await db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(inArray(roles.id, [...ids]));

    const hashMap = new Map(rows.map((row) => [row.id, row]));

    return ids.map((id) => hashMap.get(id) ?? null);
  });
}

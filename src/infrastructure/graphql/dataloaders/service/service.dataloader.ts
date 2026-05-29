import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { services } from '../../../db/schema/services.schema.js';
import { ServiceDataLoaderDto } from './service.dataloader.dto.js';

export function createServiceDataLoader(
  db: NodePgDatabase,
): DataLoader<string, ServiceDataLoaderDto | null> {
  return new DataLoader<string, ServiceDataLoaderDto | null>(async (ids) => {
    const rows = await db
      .select({
        id: services.id,
        name: services.name,
        category: services.category,
        price: services.price,
        durationMinutes: services.durationMinutes,
        createdAt: services.createdAt,
      })
      .from(services)
      .where(inArray(services.id, [...ids]));

    const map = new Map<string, ServiceDataLoaderDto>();
    for (const row of rows) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        durationMinutes: row.durationMinutes,
        createdAt: row.createdAt.toISOString(),
      });
    }

    return ids.map((id) => map.get(id) ?? null);
  });
}

import DataLoader from 'dataloader';
import { eq, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { scheduleProducts } from '../../../db/schema/schedule-products.schema.js';
import { products } from '../../../db/schema/products.schema.js';
import { ScheduleProductDto } from './schedule-products.dataloader.dto.js';

export function createScheduleProductsDataLoader(
  db: NodePgDatabase,
): DataLoader<string, ScheduleProductDto[]> {
  // Este scheduleIds é o que vem dos parents (dos resolvers de schedule que pedimos products associados)
  // Isto está definido no field resolver de products dentro de schema, chamar este dataloader e passar esses IDS
  return new DataLoader<string, ScheduleProductDto[]>(async (scheduleIds) => {
    console.log('[Schedule Ids]: ', scheduleIds);

    // O innerjoin o que faz é ver os ids em comum entre as tabelas scheduleProducts e Products
    // Retorna esses, os outros ignora
    const rows = await db
      .select({
        scheduleId: scheduleProducts.scheduleId,
        id: products.id,
        name: products.name,
        brand: products.brand,
        category: products.category,
        color: products.color,
        isAvailable: products.isAvailable,
        createdAt: products.createdAt,
      })
      .from(scheduleProducts)
      .innerJoin(products, eq(scheduleProducts.productId, products.id))
      .where(inArray(scheduleProducts.scheduleId, [...scheduleIds]));

    const map = new Map<string, ScheduleProductDto[]>();
    for (const row of rows) {
      const list = map.get(row.scheduleId) ?? [];
      list.push({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        color: row.color,
        isAvailable: row.isAvailable,
        createdAt: row.createdAt.toISOString(),
      });
      map.set(row.scheduleId, list);
    }

    return scheduleIds.map((id) => map.get(id) ?? []);
  });
}

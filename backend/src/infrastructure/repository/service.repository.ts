import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Service } from '../../domain/entity/service/service.entity.js';
import {
  FindAllServicesParams,
  IServiceRepository,
} from '../../domain/repository/service-repository.interface.js';
import { services } from '../db/schema/services.schema.js';
import { and, asc, eq } from 'drizzle-orm';
import { ServiceFactory } from '../../domain/entity/service/factory/service.factory.js';
import { ServiceCategoryValue } from '../../domain/@shared/value-object/service-category/service-category.vo.js';

export class ServiceRepository implements IServiceRepository {
  private readonly db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  async findById(id: string): Promise<Service | null> {
    const rows = await this.db.select().from(services).where(eq(services.id, id)).limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];

    return ServiceFactory.reconstitute({
      id: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findAll(params: FindAllServicesParams): Promise<Service[]> {
    const rows = await this.db
      .select()
      .from(services)
      .where(params.category ? eq(services.category, params.category) : undefined)
      .orderBy(asc(services.createdAt), asc(services.id))
      .limit(params.limit)
      .offset(params.offset);

    return rows.map((row) =>
      ServiceFactory.reconstitute({
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        durationMinutes: row.durationMinutes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async findByNameAndCategory(name: string, category: string): Promise<Service | null> {
    const rows = await this.db
      .select()
      .from(services)
      .where(and(eq(services.name, name), eq(services.category, category as ServiceCategoryValue)))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];

    return ServiceFactory.reconstitute({
      id: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(service: Service): Promise<void> {
    await this.db.insert(services).values({
      id: service.id,
      name: service.name,
      category: service.category.value,
      price: service.price.value.toFixed(2),
      durationMinutes: service.durationMinutes,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    });
  }

  async update(service: Service): Promise<void> {
    await this.db
      .update(services)
      .set({
        name: service.name,
        category: service.category.value,
        price: service.price.value.toFixed(2),
        durationMinutes: service.durationMinutes,
        updatedAt: service.updatedAt,
      })
      .where(eq(services.id, service.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(services).where(eq(services.id, id));
  }
}

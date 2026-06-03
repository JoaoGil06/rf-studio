import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { Product } from '../../domain/entity/product/product.entity.js';
import { IProductRepository } from '../../domain/repository/product-repository.interface.js';
import { products } from '../db/schema/products.schema.js';
import { ProductFactory } from '../../domain/entity/product/factory/product.factory.js';

export class ProductRepository implements IProductRepository {
  private readonly db: NodePgDatabase;

  constructor(db: NodePgDatabase) {
    this.db = db;
  }

  async findByNameAndBrand(name: string, brand: string): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(products)
      .where(and(eq(products.name, name), eq(products.brand, brand)))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];

    return ProductFactory.reconstitute({
      id: row.id,
      name: row.name,
      brand: row.brand,
      color: row.color,
      isAvailable: row.isAvailable,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(product: Product): Promise<void> {
    await this.db.insert(products).values({
      id: product.id,
      name: product.name,
      brand: product.brand,
      color: product.color,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}
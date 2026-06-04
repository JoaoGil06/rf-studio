import { Product } from '../entity/product/product.entity.js';

export interface IProductRepository {
  findByNameAndBrand(name: string, brand: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(params: { limit: number; offset: number }): Promise<Product[]>;
}
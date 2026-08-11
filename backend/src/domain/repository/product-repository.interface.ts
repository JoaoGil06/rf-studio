import { ServiceCategoryValue } from '../@shared/value-object/service-category/service-category.vo.js';
import { Product } from '../entity/product/product.entity.js';

export interface FindAllProductsParams {
  limit: number;
  offset: number;
  /** Undefined means every category. Already validated by the time it gets here. */
  category?: ServiceCategoryValue;
}

export interface IProductRepository {
  findByNameAndBrand(name: string, brand: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  findAll(params: FindAllProductsParams): Promise<Product[]>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}

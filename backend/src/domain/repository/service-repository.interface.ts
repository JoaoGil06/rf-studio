import { ServiceCategoryValue } from '../@shared/value-object/service-category/service-category.vo.js';
import { Service } from '../entity/service/service.entity.js';

export interface FindAllServicesParams {
  limit: number;
  offset: number;
  /** Undefined means every category. Already validated by the time it gets here. */
  category?: ServiceCategoryValue;
}

export interface IServiceRepository {
  findByNameAndCategory(name: string, category: string): Promise<Service | null>;
  save(service: Service): Promise<void>;
  findById(id: string): Promise<Service | null>;
  findAll(params: FindAllServicesParams): Promise<Service[]>;
  update(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
}

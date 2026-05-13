import { Service } from '../entity/service/service.entity.js';

export interface IServiceRepository {
  findByNameAndCategory(name: string, category: string): Promise<Service | null>;
  save(service: Service): Promise<void>;
}

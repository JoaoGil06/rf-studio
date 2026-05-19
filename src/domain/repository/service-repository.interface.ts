import { Service } from '../entity/service/service.entity.js';

export interface IServiceRepository {
  findByNameAndCategory(name: string, category: string): Promise<Service | null>;
  save(service: Service): Promise<void>;
  findById(id: string): Promise<Service | null>;
  findAll(params: { limit: number; offset: number }): Promise<Service[]>;
  update(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
}

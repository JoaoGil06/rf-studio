import { IServiceRepository } from '../../../domain/repository/service-repository.interface.js';
import { decodeCursor, encodeCursor } from '../../shared/cursor.js';
import { GetServicesInputDto, GetServicesOutputDto, ServiceNodeDto } from './get-services.dto.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class GetServicesUseCase {
  private readonly serviceRepository: IServiceRepository;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(input: GetServicesInputDto): Promise<GetServicesOutputDto> {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;

    // Aqui pede first + 1 que é para saber se existe nextPage
    const rows = await this.serviceRepository.findAll({ limit: first + 1, offset });

    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;

    const edges = items.map((service, index) => {
      const node: ServiceNodeDto = {
        id: service.id,
        name: service.name,
        category: service.category.value,
        price: service.price.value,
        durationMinutes: service.durationMinutes,
        createdAt: service.createdAt.toISOString(),
      };

      return { node, cursor: encodeCursor(offset + index) };
    });

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
    };
  }
}

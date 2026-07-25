import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { decodeCursor, encodeCursor } from '../../shared/cursor.js';
import { GetUsersInputDto, GetUsersOutputDto, UserNodeDto } from './get-users.dto.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class GetUsersUseCase {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(input: GetUsersInputDto): Promise<GetUsersOutputDto> {
    const first = Math.min(input.first ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = input.after ? decodeCursor(input.after) + 1 : 0;

    // Aqui pede first + 1 que é para saber se existe nextPage
    const rows = await this.userRepository.findAll({ limit: first + 1, offset });

    const hasNextPage = rows.length > first;
    const items = hasNextPage ? rows.slice(0, first) : rows;

    const edges = items.map((user, index) => {
      const node: UserNodeDto = {
        id: user.id,
        roleId: user.roleId,
        name: user.name,
        email: user.email.value,
        phoneNumber: user.phone.value,
        birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
        createdAt: user.createdAt.toISOString(),
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

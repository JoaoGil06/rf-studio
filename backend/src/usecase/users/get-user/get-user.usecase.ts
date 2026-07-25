import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import type { GetUserInputDto, GetUserOutputDto } from './get-user.dto.js';

export class GetUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(input: GetUserInputDto): Promise<GetUserOutputDto> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new EntityNotFoundError(`User with id ${input.id} not found`);
    }

    return {
      id: user.id,
      roleId: user.roleId,
      name: user.name,
      email: user.email.value,
      phoneNumber: user.phone.value,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

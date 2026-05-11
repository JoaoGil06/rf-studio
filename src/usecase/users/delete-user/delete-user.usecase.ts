import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { DeleteUserInputDto, DeleteUserOutputDto } from './delete-user.dto.js';
import { deleteUserSchema } from './delete-user.schema-validator.js';

export class DeleteUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(userRepository: IUserRepository, validationAdapter: IValidationAdapter) {
    this.userRepository = userRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(input: DeleteUserInputDto): Promise<DeleteUserOutputDto> {
    const validated = this.validationAdapter.validate<DeleteUserInputDto>(deleteUserSchema, input);

    const user = await this.userRepository.findById(validated.id);

    if (!user) {
      throw new EntityNotFoundError(`User with id ${validated.id} not found`);
    }

    await this.userRepository.delete(user.id);

    return {
      id: user.id,
    };
  }
}

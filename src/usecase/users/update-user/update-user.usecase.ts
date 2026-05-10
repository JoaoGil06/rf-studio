import { ConflictError } from '../../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../../domain/@shared/errors/entityNotFoundError.js';
import type { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import type { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { UpdateUserInputDto, UpdateUserOutputDto } from './update-user.dto.js';
import { updateUserSchema } from './update-user.schema-validator.js';

export class UpdateUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly validationAdapter: IValidationAdapter;

  constructor(userRepository: IUserRepository, validationAdapter: IValidationAdapter) {
    this.userRepository = userRepository;
    this.validationAdapter = validationAdapter;
  }

  async execute(inputDto: UpdateUserInputDto): Promise<UpdateUserOutputDto> {
    const validated = this.validationAdapter.validate<UpdateUserInputDto>(
      updateUserSchema,
      inputDto,
    );

    const user = await this.userRepository.findById(validated.id);
    if (!user) {
      throw new EntityNotFoundError(`User with id ${validated.id} not found`);
    }

    if (validated.email !== undefined && validated.email !== user.email.value) {
      const existing = await this.userRepository.findByEmail(validated.email);
      if (existing) {
        throw new ConflictError(`Email already registered: ${validated.email}`);
      }
    }

    user.updateUserProfile({
      name: validated.name,
      email: validated.email,
      phoneNumber: validated.phoneNumber,
      birthDate: validated.birthDate,
    });

    await this.userRepository.update(user);

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

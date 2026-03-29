import { ConflictError } from '../../domain/@shared/errors/conflictError.js';
import { EntityNotFoundError } from '../../domain/@shared/errors/entityNotFoundError.js';
import { UserFactory } from '../../domain/entity/user/factory/user.factory.js';
import { IUserRepository } from '../../domain/repository/user-repository.interface.js';
import { IHashAdapter } from '../interfaces/hash-adapter.interface.js';
import { IValidationAdapter } from '../interfaces/validation-adapter.interface.js';
import { RegisterUserInputDto, RegisterUserOutputDto } from './register-user.dto.js';
import { registerUserSchema } from './register-user.schema-validator.js';

export class RegisterUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly hashAdapter: IHashAdapter;
  private readonly validationAdapter: IValidationAdapter;

  constructor(
    userRepository: IUserRepository,
    hashAdapter: IHashAdapter,
    validationAdapter: IValidationAdapter,
  ) {
    this.userRepository = userRepository;
    this.hashAdapter = hashAdapter;
    this.validationAdapter = validationAdapter;
  }

  async execute(inputDto: RegisterUserInputDto): Promise<RegisterUserOutputDto> {
    const validatedData = this.validationAdapter.validate<RegisterUserInputDto>(
      registerUserSchema,
      inputDto,
    );

    const userAlreadyExist = await this.userRepository.findByEmail(validatedData.email);
    if (userAlreadyExist)
      throw new ConflictError(`Email already registered: ${validatedData.email}`);

    const clientRoleId = await this.userRepository.findRoleIdByName('client');
    if (!clientRoleId) throw new EntityNotFoundError("Role 'client' not found");

    const passwordHash = await this.hashAdapter.hash(validatedData.password);

    const user = UserFactory.create({
      roleId: clientRoleId,
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      phoneNumber: validatedData.phoneNumber,
      birthDate: validatedData.birthDate,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      phoneNumber: user.phone.value,
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

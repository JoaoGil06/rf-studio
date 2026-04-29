import { UnathorizedError } from '../../../domain/@shared/errors/unathorizedError.js';
import { IUserRepository } from '../../../domain/repository/user-repository.interface.js';
import { IHashAdapter } from '../../interfaces/hash-adapter.interface.js';
import { IJwtAdapter } from '../../interfaces/jwt-adapter.interface.js';
import { IValidationAdapter } from '../../interfaces/validation-adapter.interface.js';
import { LoginUserInputDto, LoginUserOutputDto } from './login.dto.js';
import { loginUserSchema } from './login.schema-validator.js';

export class LoginUseCase {
  private readonly userRepository: IUserRepository;
  private readonly hashAdapter: IHashAdapter;
  private readonly jwtAdapter: IJwtAdapter;
  private readonly validationAdapter: IValidationAdapter;

  constructor(
    userRepository: IUserRepository,
    hashAdapter: IHashAdapter,
    jwtAdapter: IJwtAdapter,
    validationAdapter: IValidationAdapter,
  ) {
    this.userRepository = userRepository;
    this.hashAdapter = hashAdapter;
    this.jwtAdapter = jwtAdapter;
    this.validationAdapter = validationAdapter;
  }

  async execute(inputDto: LoginUserInputDto): Promise<LoginUserOutputDto> {
    const inputValid = this.validationAdapter.validate<LoginUserInputDto>(
      loginUserSchema,
      inputDto,
    );

    const normalizedEmail = inputValid.email.toLowerCase().trim();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) throw new UnathorizedError('Invalid Credentials');

    const isPasswordMatch = await this.hashAdapter.compare(inputValid.password, user.passwordHash);
    if (!isPasswordMatch) throw new UnathorizedError('Invalid Credentials');

    const token = this.jwtAdapter.sign({
      sub: user.id,
      roleId: user.roleId,
      email: user.email.value,
    });

    return {
      token,
      user: {
        id: user.id,
        roleId: user.roleId,
        name: user.name,
        email: user.email.value,
        phoneNumber: user.phone.value,
        birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }
}

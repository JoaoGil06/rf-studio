import { UnathorizedError } from '../../../domain/@shared/errors/unathorizedError.js';
import { IJwtAdapter } from '../../interfaces/jwt-adapter.interface.js';
import { LogoutOutputDto } from './logout.dto.js';

export class LogoutUseCase {
  private readonly jwtAdapter: IJwtAdapter;

  constructor(jwtAdapter: IJwtAdapter) {
    this.jwtAdapter = jwtAdapter;
  }

  async execute(token: string | null): Promise<LogoutOutputDto> {
    if (!token) throw new UnathorizedError('Missing authentication token');

    // Se não for válido, o próprio método já lança um erro
    this.jwtAdapter.verify(token);

    return {
      success: true,
    };
  }
}

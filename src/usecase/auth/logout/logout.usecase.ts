import { LogoutOutputDto } from './logout.dto.js';

export class LogoutUseCase {
  async execute(): Promise<LogoutOutputDto> {
    return {
      success: true,
    };
  }
}

import bcrypt from 'bcryptjs';
import type { IHashAdapter } from '../../usecase/interfaces/hash-adapter.interface.js';

export class BcryptAdapter implements IHashAdapter {
  private readonly saltRounds = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }
}

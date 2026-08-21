import { randomBytes } from 'node:crypto';
import type { IPasswordGeneratorAdapter } from '../../usecase/interfaces/password-generator-adapter.interface.js';

const PASSWORD_BYTES = 32;

export class CryptoPasswordGeneratorAdapter implements IPasswordGeneratorAdapter {
  generate(): string {
    return randomBytes(PASSWORD_BYTES).toString('base64url');
  }
}

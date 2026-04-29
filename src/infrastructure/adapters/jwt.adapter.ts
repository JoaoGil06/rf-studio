import jwt from 'jsonwebtoken';
import { IJwtAdapter, JwtPayload } from '../../usecase/interfaces/jwt-adapter.interface.js';
import { UnathorizedError } from '../../domain/@shared/errors/unathorizedError.js';
import { JWT_EXPIRES_IN } from '../constants/env.js';

export class JwtAdapter implements IJwtAdapter {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  sign(payload: JwtPayload): string {
    const jwtExpiresIn = JWT_EXPIRES_IN ?? '7d';
    return jwt.sign(payload, this.secret, {
      expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw new UnathorizedError('Invalid or expired token');
    }
  }
}

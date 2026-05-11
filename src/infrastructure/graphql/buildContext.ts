import type { Request } from 'express';
import type { AppContext, AppDataLoaders, AppUseCases } from './context.types.js';
import { extractBearerToken } from './helpers/extract-berarer-token.js';
import { JwtPayload } from 'jsonwebtoken';
import { IJwtAdapter } from '../../usecase/interfaces/jwt-adapter.interface.js';

export function buildContext(
  useCases: AppUseCases,
  dataLoaders: AppDataLoaders,
  jwtAdapter: IJwtAdapter,
) {
  return async ({ req }: { req: Request }): Promise<AppContext> => {
    const token = extractBearerToken(req.headers.authorization);

    let currentUser: JwtPayload | null = null;

    if (token) {
      try {
        currentUser = jwtAdapter.verify(token);
      } catch {
        currentUser = null;
      }
    }

    return {
      currentUser,
      useCases,
      dataLoaders,
    };
  };
}

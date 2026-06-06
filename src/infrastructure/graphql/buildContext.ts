import type { Request } from 'express';
import type { AppContext, AppUseCases } from './context.types.js';
import { extractBearerToken } from './helpers/extract-berarer-token.js';
import { JwtPayload } from 'jsonwebtoken';
import { IJwtAdapter } from '../../usecase/interfaces/jwt-adapter.interface.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createRoleDataLoader } from './dataloaders/role/role.dataloader.js';
import { createUserDataLoader } from './dataloaders/user/user.dataloader.js';
import { createServiceDataLoader } from './dataloaders/service/service.dataloader.js';
import { createScheduleProductsDataLoader } from './dataloaders/schedule-products/schedule-products.dataloader.js';

export function buildContext(useCases: AppUseCases, db: NodePgDatabase, jwtAdapter: IJwtAdapter) {
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
      dataLoaders: {
        role: createRoleDataLoader(db),
        user: createUserDataLoader(db),
        service: createServiceDataLoader(db),
        scheduleProducts: createScheduleProductsDataLoader(db),
      },
    };
  };
}

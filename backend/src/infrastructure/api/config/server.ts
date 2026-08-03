import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import cors from 'cors';
import express from 'express';

import type { AppContext } from '../../graphql/context.types.js';
import { typeDefs } from '../../graphql/schema/schema.js';
import { resolvers } from '../../graphql/resolvers/index.js';
import { buildContext } from '../../graphql/buildContext.js';
import {
  buildDeleteScheduleUseCase,
  buildDeleteServiceUseCase,
  buildDeleteUserUseCase,
  buildGetSchedulesInRangeUseCase,
  buildGetSchedulesUseCase,
  buildGetScheduleUseCase,
  buildGetProductUseCase,
  buildGetProductsUseCase,
  buildUpdateProductUseCase,
  buildDeleteProductUseCase,
  buildGetServicesUseCase,
  buildGetServiceUseCase,
  buildGetUsersUseCase,
  buildGetUserUseCase,
  buildJwtAdapter,
  buildLoginUseCase,
  buildLogoutUseCase,
  buildRegisterProductUseCase,
  buildRegisterScheduleUseCase,
  buildRegisterServiceUseCase,
  buildRegisterUserUseCase,
  buildUpdateScheduleUseCase,
  buildUpdateServiceUseCase,
  buildUpdateUserUseCase,
  buildUploadPhotoUseCase,
  db,
  buildCompleteScheduleUseCase,
} from '../../container.js';
import { PORT, ASSETS_DIR } from '../../constants/env.js';
import { requireAuthPlugin } from '../../graphql/plugins/require-auth/require-auth.plugin.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function startServer() {
  const jwtAdapter = buildJwtAdapter();

  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    plugins: [requireAuthPlugin()],
  });
  await server.start();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/assets', express.static(ASSETS_DIR));

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: MAX_BYTES, maxFiles: 1 }),
    expressMiddleware(server, {
      context: buildContext(
        {
          login: buildLoginUseCase(),
          logout: buildLogoutUseCase(),
          registerUser: buildRegisterUserUseCase(),
          getUsers: buildGetUsersUseCase(),
          getUser: buildGetUserUseCase(),
          updateUser: buildUpdateUserUseCase(),
          deleteUser: buildDeleteUserUseCase(),
          registerService: buildRegisterServiceUseCase(),
          getService: buildGetServiceUseCase(),
          getServices: buildGetServicesUseCase(),
          updateService: buildUpdateServiceUseCase(),
          deleteService: buildDeleteServiceUseCase(),
          registerSchedule: buildRegisterScheduleUseCase(),
          getSchedule: buildGetScheduleUseCase(),
          getSchedules: buildGetSchedulesUseCase(),
          getSchedulesInRange: buildGetSchedulesInRangeUseCase(),
          updateSchedule: buildUpdateScheduleUseCase(),
          deleteSchedule: buildDeleteScheduleUseCase(),
          uploadPhoto: buildUploadPhotoUseCase(),
          registerProduct: buildRegisterProductUseCase(),
          getProduct: buildGetProductUseCase(),
          getProducts: buildGetProductsUseCase(),
          updateProduct: buildUpdateProductUseCase(),
          deleteProduct: buildDeleteProductUseCase(),
          completeSchedule: buildCompleteScheduleUseCase(),
        },
        db,
        jwtAdapter,
      ),
    }),
  );

  app.listen(PORT, () => {
    console.log(`RF-Studio is running at http://localhost:${PORT}/graphql`);
  });
}

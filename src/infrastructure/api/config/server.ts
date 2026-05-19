import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';

import type { AppContext } from '../../graphql/context.types.js';
import { typeDefs } from '../../graphql/schema/schema.js';
import { resolvers } from '../../graphql/resolvers/index.js';
import { buildContext } from '../../graphql/buildContext.js';
import {
  buildDeleteUserUseCase,
  buildGetServicesUseCase,
  buildGetServiceUseCase,
  buildGetUsersUseCase,
  buildGetUserUseCase,
  buildJwtAdapter,
  buildLoginUseCase,
  buildLogoutUseCase,
  buildRegisterServiceUseCase,
  buildRegisterUserUseCase,
  buildRoleDataLoader,
  buildUpdateUserUseCase,
} from '../../container.js';
import { PORT } from '../../constants/env.js';
import { requireAuthPlugin } from '../../graphql/plugins/require-auth/require-auth.plugin.js';

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
  app.use(
    '/graphql',
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
        },
        {
          role: buildRoleDataLoader(),
        },
        jwtAdapter,
      ),
    }),
  );

  app.listen(PORT, () => {
    console.log(`RF-Studio is running at http://localhost:${PORT}/graphql`);
  });
}

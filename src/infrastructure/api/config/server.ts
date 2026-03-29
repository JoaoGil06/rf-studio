import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';

import type { AppContext } from '../../graphql/context.js';
import { typeDefs } from '../../graphql/schema/schema.js';
import { resolvers } from '../../graphql/resolvers/index.js';
import { buildContext } from '../../graphql/buildContext.js';
import { buildRegisterUserUseCase } from '../../container.js';
import { PORT } from '../../constants/env.js';

export async function startServer() {
  const server = new ApolloServer<AppContext>({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: buildContext({ registerUser: buildRegisterUserUseCase() }),
    }),
  );

  app.listen(PORT, () => {
    console.log(`RF-Studio is running at http://localhost:${PORT}/graphql`);
  });
}

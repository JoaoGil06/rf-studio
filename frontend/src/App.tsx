import { ApolloProvider } from '@apollo/client/react';
import { RouterProvider } from 'react-router-dom';
import { client } from './graphql/client';
import { ThemeProvider } from './providers/theme/theme.provider';
import { router } from './routes';

export function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ApolloProvider>
  );
}

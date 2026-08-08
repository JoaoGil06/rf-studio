import { SetContextLink } from '@apollo/client/link/context';
import { authStorage } from '../../lib/adapters/auth-storage/auth-storage.adapter';

/**
 * Attaches the stored JWT as a Bearer header.
 */
export const authLink = new SetContextLink((prevContext) => {
  const session = authStorage.get();
  if (!session) return prevContext;

  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: `Bearer ${session.token}`,
    },
  };
});

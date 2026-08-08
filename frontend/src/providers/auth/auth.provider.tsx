import { useApolloClient } from '@apollo/client/react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { authStorage } from '../../lib/adapters/auth-storage/auth-storage.adapter';
import type { StoredUser } from '../../lib/adapters/auth-storage/auth-storage.interface';
import { AuthContext, type AuthContextValue } from './auth.context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useApolloClient();
  const [user, setUser] = useState<StoredUser | null>(() => authStorage.get()?.user ?? null);

  const signIn = useCallback((session: { token: string; user: StoredUser }) => {
    authStorage.set(session);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    authStorage.clear();
    setUser(null);

    await client.clearStore();
  }, [client]);

  const authContextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

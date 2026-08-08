import { createContext } from 'react';
import type { StoredUser } from '../../lib/adapters/auth-storage/auth-storage.interface';

export interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  signIn: (session: { token: string; user: StoredUser }) => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

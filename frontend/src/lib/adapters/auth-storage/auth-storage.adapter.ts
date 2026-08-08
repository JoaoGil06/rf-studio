import type { IAuthStorage, StoredSession } from './auth-storage.interface';
import { createStorageGuard } from '../safe-storage';

export const AUTH_STORAGE_KEY = 'rf-session';

const guard = createStorageGuard('authStorage');

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<StoredSession>;
  return typeof candidate.token === 'string' && typeof candidate.user?.id === 'string';
}

export const authStorage: IAuthStorage = {
  get: () =>
    guard.read(
      'read',
      () => {
        const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isStoredSession(parsed) ? parsed : null;
      },
      null,
    ),

  set: (session) =>
    guard.mutate('write', () =>
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session)),
    ),

  clear: () => guard.mutate('clear', () => window.localStorage.removeItem(AUTH_STORAGE_KEY)),
};

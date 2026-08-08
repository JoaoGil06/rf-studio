export interface StoredUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
}

export interface StoredSession {
  token: string;
  user: StoredUser;
}

export interface IAuthStorage {
  get(): StoredSession | null;
  set(session: StoredSession): void;
  clear(): void;
}

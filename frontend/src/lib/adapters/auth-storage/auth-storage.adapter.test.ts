import { AUTH_STORAGE_KEY, authStorage } from './auth-storage.adapter';
import type { StoredSession } from './auth-storage.interface';

const session: StoredSession = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Rita Ferreira', email: 'rita@rfstudio.pt', roleName: 'Admin' },
};

beforeEach(() => {
  window.localStorage.clear();
  // The adapter warns in dev on every swallowed failure; silence it here and
  // assert on it where it is the point of the test.
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authStorage', () => {
  it('returns null when nothing is stored', () => {
    expect(authStorage.get()).toBeNull();
  });

  it('round-trips a session through set/get', () => {
    authStorage.set(session);

    expect(authStorage.get()).toEqual(session);
  });

  it('clear removes the stored record', () => {
    authStorage.set(session);

    authStorage.clear();

    expect(authStorage.get()).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('returns null and does not throw on malformed JSON', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{not json');

    expect(() => authStorage.get()).not.toThrow();
    expect(authStorage.get()).toBeNull();
  });

  it('returns null when the record has no token', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: session.user }));

    expect(authStorage.get()).toBeNull();
  });

  it('returns null when the record has no user', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'jwt-token' }));

    expect(authStorage.get()).toBeNull();
  });

  it('swallows a throwing setItem but says so, so a blocked origin is visible', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => authStorage.set(session)).not.toThrow();
    // The bare catch is what made a browser-level block look like an app bug.
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[authStorage] write failed'),
      expect.any(Error),
    );
  });

  it('swallows a throwing removeItem instead of propagating', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => authStorage.clear()).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[authStorage] clear failed'),
      expect.any(Error),
    );
  });
});

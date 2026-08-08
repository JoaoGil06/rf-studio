import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, screen } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { authStorage } from '../../lib/adapters/auth-storage/auth-storage.adapter';
import type { StoredSession } from '../../lib/adapters/auth-storage/auth-storage.interface';
import type { AuthContextValue } from './auth.context';
import { AuthProvider } from './auth.provider';

const session: StoredSession = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Rita Ferreira', email: 'rita@rfstudio.pt', roleName: 'Admin' },
};

let renders: AuthContextValue[] = [];

function Probe() {
  const auth = useAuth();
  renders.push(auth);

  return (
    <div>
      <span data-testid="state">{auth.isAuthenticated ? 'in' : 'out'}</span>
      <span data-testid="user">{auth.user?.name ?? '—'}</span>
      <button type="button" onClick={() => auth.signIn(session)}>
        entrar
      </button>
      <button type="button" onClick={() => void auth.signOut()}>
        sair
      </button>
    </div>
  );
}

/**
 * `fetchMock` is here to be asserted *never* called: signing out is a local
 * teardown. Revoking the session server-side belongs to whichever unit triggers
 * the action, not to the provider that holds the state.
 */
function renderProbe() {
  const fetchMock = vi.fn(() => {
    throw new Error('no request should leave the provider');
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([new HttpLink({ uri: '/graphql', fetch: fetchMock })]),
  });
  const clearStore = vi.spyOn(client, 'clearStore');

  const utils = render(
    <ApolloProvider client={client}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </ApolloProvider>,
  );

  return { ...utils, clearStore, fetchMock };
}

function lastRender(): AuthContextValue {
  const value = renders.at(-1);
  if (!value) throw new Error('Probe never rendered');
  return value;
}

beforeEach(() => {
  renders = [];
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AuthProvider', () => {
  it('hydrates a stored session on the very first render', () => {
    authStorage.set(session);

    renderProbe();

    // No `waitFor`, and deliberately so: the read is synchronous, so the session
    // is settled before anything paints. There is no frame in which a guard could
    // read "not authenticated" and bounce a signed-in user to /login.
    expect(screen.getByTestId('state')).toHaveTextContent('in');
    expect(screen.getByTestId('user')).toHaveTextContent('Rita Ferreira');
    expect(renders).toHaveLength(1);
  });

  it('renders unauthenticated when nothing is stored', () => {
    renderProbe();

    expect(screen.getByTestId('state')).toHaveTextContent('out');
    expect(lastRender().user).toBeNull();
    expect(renders).toHaveLength(1);
  });

  it('signIn persists the session through the adapter', () => {
    renderProbe();

    act(() => {
      screen.getByRole('button', { name: 'entrar' }).click();
    });

    expect(authStorage.get()).toEqual(session);
    expect(screen.getByTestId('state')).toHaveTextContent('in');
  });

  it('signOut clears the adapter, empties the store and drops the session', async () => {
    authStorage.set(session);
    const { clearStore, fetchMock } = renderProbe();

    await act(async () => {
      screen.getByRole('button', { name: 'sair' }).click();
    });

    expect(authStorage.get()).toBeNull();
    expect(clearStore).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('state')).toHaveTextContent('out');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Probe />)).toThrow(/must be used inside AuthProvider/);
    } finally {
      consoleError.mockRestore();
    }
  });
});

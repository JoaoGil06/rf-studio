import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { authStorage } from '../../lib/adapters/auth-storage/auth-storage.adapter';
import type { StoredSession } from '../../lib/adapters/auth-storage/auth-storage.interface';
import { authLink } from './auth.link';
import { errorLink } from './error.link';

/**
 * A real schema field, not a placeholder: `pnpm codegen` scans test files too and
 * validates every document against the backend SDL.
 */
const PING = gql`
  query Ping {
    users(first: 1) {
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const PING_RESULT = { data: { users: { pageInfo: { hasNextPage: false } } } };

const session: StoredSession = {
  token: 'jwt-token',
  user: { id: 'user-1', name: 'Rita Ferreira', email: 'rita@rfstudio.pt', roleName: 'Admin' },
};

/**
 * Exercises the real chain rather than the link in isolation — the header is only
 * observable once `httpLink` has turned the context into a request, and the order
 * of the three links is itself part of what is under test.
 */
function createClient(body: unknown) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      errorLink,
      authLink,
      new HttpLink({ uri: '/graphql', fetch: fetchMock }),
    ]),
  });

  return { client, fetchMock };
}

function requestHeaders(fetchMock: ReturnType<typeof vi.fn>): Record<string, string> {
  const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
  return (init?.headers ?? {}) as Record<string, string>;
}

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authLink', () => {
  it('sends no authorization header when no session is stored', async () => {
    const { client, fetchMock } = createClient(PING_RESULT);

    await client.query({ query: PING });

    expect(requestHeaders(fetchMock)).not.toHaveProperty('authorization');
  });

  it('sends the token as an exact `Bearer <token>` value', async () => {
    authStorage.set(session);
    const { client, fetchMock } = createClient(PING_RESULT);

    await client.query({ query: PING });

    expect(requestHeaders(fetchMock).authorization).toBe('Bearer jwt-token');
  });

  it('preserves unrelated headers already on the context', async () => {
    authStorage.set(session);
    const { client, fetchMock } = createClient(PING_RESULT);

    await client.query({ query: PING, context: { headers: { 'accept-language': 'pt-PT' } } });

    const headers = requestHeaders(fetchMock);
    expect(headers['accept-language']).toBe('pt-PT');
    expect(headers.authorization).toBe('Bearer jwt-token');
  });
});

describe('errorLink', () => {
  it('clears the stored session when a response carries UNAUTHENTICATED', async () => {
    authStorage.set(session);
    const { client } = createClient({
      data: null,
      errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
    });

    await expect(client.query({ query: PING })).rejects.toThrow();

    expect(authStorage.get()).toBeNull();
  });

  it('leaves the stored session alone for any other GraphQL error', async () => {
    authStorage.set(session);
    const { client } = createClient({
      data: null,
      errors: [{ message: 'Bad input', extensions: { code: 'BAD_USER_INPUT' } }],
    });

    await expect(client.query({ query: PING })).rejects.toThrow();

    expect(authStorage.get()).toEqual(session);
  });
});

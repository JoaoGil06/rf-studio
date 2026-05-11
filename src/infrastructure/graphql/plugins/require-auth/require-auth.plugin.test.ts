import { describe, it, expect, vi } from 'vitest';
import { GraphQLError, parse } from 'graphql';
import { requireAuthPlugin } from './require-auth.plugin.js';
import type { AppContext } from '../../context.types.js';

const makeContext = (overrides: Partial<AppContext> = {}): AppContext =>
  ({
    token: null,
    currentUser: null,
    useCases: {} as AppContext['useCases'],
    dataLoaders: {} as AppContext['dataLoaders'],
    ...overrides,
  }) as AppContext;

const runDidResolveOperation = async (query: string, contextValue: AppContext) => {
  const document = parse(query);
  const operation = document.definitions[0];
  if (operation.kind !== 'OperationDefinition') {
    throw new Error('test setup: not an OperationDefinition');
  }

  const plugin = requireAuthPlugin();
  const requestListener = await plugin.requestDidStart!({
    contextValue,
    request: {},
    document,
    operation,
    schema: {},
    operationName: operation.name?.value ?? null,
    metrics: {},
    overallCachePolicy: {},
    cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
    logger: console,
  } as never);

  await requestListener!.didResolveOperation!({
    operation,
    operationName: operation.name?.value ?? null,
    document,
    request: {},
    contextValue,
    schema: {},
    metrics: {},
    overallCachePolicy: {},
    cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
    logger: console,
  } as never);
};

describe('requireAuthPlugin', () => {
  it('allows public mutations (login) without a currentUser', async () => {
    await expect(
      runDidResolveOperation(
        `mutation { login(input: { email: "a@b.com", password: "x" }) { __typename } }`,
        makeContext({ currentUser: null }),
      ),
    ).resolves.not.toThrow();
  });

  it('allows public mutations (registerUser) without a currentUser', async () => {
    await expect(
      runDidResolveOperation(
        `mutation { registerUser(input: { name: "A", email: "a@b.com", password: "x", phoneNumber: "+1" }) { __typename } }`,
        makeContext({ currentUser: null }),
      ),
    ).resolves.not.toThrow();
  });

  it('allows introspection without a currentUser', async () => {
    await expect(
      runDidResolveOperation(`query { __schema { types { name } } }`, makeContext()),
    ).resolves.not.toThrow();
  });

  it('throws UNAUTHENTICATED when a protected query is called without a currentUser', async () => {
    await expect(
      runDidResolveOperation(`query { users { edges { node { id } } } }`, makeContext()),
    ).rejects.toMatchObject({
      message: expect.stringMatching(/authenticated/i),
      extensions: { code: 'UNAUTHENTICATED' },
    });
  });

  it('throws UNAUTHENTICATED when a protected mutation (logout) is called without a currentUser', async () => {
    await expect(
      runDidResolveOperation(`mutation { logout { success } }`, makeContext()),
    ).rejects.toMatchObject({ extensions: { code: 'UNAUTHENTICATED' } });
  });

  it('allows protected operations when currentUser is present', async () => {
    await expect(
      runDidResolveOperation(
        `query { users { edges { node { id } } } }`,
        makeContext({
          currentUser: { sub: 'u1', roleId: 'r1', email: 'a@b.com' },
        }),
      ),
    ).resolves.not.toThrow();
  });

  it('rejects a batched selection when ANY field is protected and currentUser is null', async () => {
    await expect(
      runDidResolveOperation(
        `mutation Batch {
          login(input: { email: "a@b.com", password: "x" }) { __typename }
          logout { success }
        }`,
        makeContext(),
      ),
    ).rejects.toBeInstanceOf(GraphQLError);
  });
});

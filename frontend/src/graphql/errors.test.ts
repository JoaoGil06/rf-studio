import { CombinedGraphQLErrors } from '@apollo/client';
import { isBadUserInput } from './errors';

function aCombinedError(...codes: string[]) {
  return new CombinedGraphQLErrors({
    data: null,
    errors: codes.map((code) => ({ message: `boom (${code})`, extensions: { code } })),
  });
}

describe('isBadUserInput', () => {
  it('recognises a BAD_USER_INPUT extension', () => {
    expect(isBadUserInput(aCombinedError('BAD_USER_INPUT'))).toBe(true);
  });

  it('leaves another GraphQL error code alone', () => {
    expect(isBadUserInput(aCombinedError('UNAUTHENTICATED'))).toBe(false);
  });

  it('is true when one of several errors is a BAD_USER_INPUT', () => {
    expect(isBadUserInput(aCombinedError('UNAUTHENTICATED', 'BAD_USER_INPUT'))).toBe(true);
  });

  it('treats a transport failure as something else entirely', () => {
    expect(isBadUserInput(new Error('Failed to fetch'))).toBe(false);
  });

  it('survives being handed nothing', () => {
    expect(isBadUserInput(null)).toBe(false);
    expect(isBadUserInput(undefined)).toBe(false);
  });
});

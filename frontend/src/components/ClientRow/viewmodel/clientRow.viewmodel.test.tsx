import { renderHook } from '@testing-library/react';
import type { ClientRowFieldsFragment } from '../../../graphql/generated/graphql';
import { UNKNOWN_INITIAL, useClientRowViewModel } from './clientRow.viewmodel';

const clientMock = vi.fn();

vi.mock('../model/clientRow.model', () => ({
  useClientRowModel: () => ({ client: clientMock() }),
}));

function aClient(overrides: Partial<ClientRowFieldsFragment> = {}) {
  return {
    id: 'client-1',
    name: 'Maria Silva',
    email: 'maria@exemplo.pt',
    phoneNumber: '912345678',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useClientRowViewModel', () => {
  it('returns null while the fragment is missing from the cache', () => {
    clientMock.mockReturnValue(null);

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current).toBeNull();
  });

  it('groups the telemóvel in threes', () => {
    clientMock.mockReturnValue(aClient());

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current?.phoneNumber).toBe('912 345 678');
  });

  it('leaves a number it cannot group exactly as it was stored', () => {
    clientMock.mockReturnValue(aClient({ phoneNumber: '+351912345678' }));

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current?.phoneNumber).toBe('+351912345678');
  });

  it('derives the avatar initial from the first letter of the name', () => {
    clientMock.mockReturnValue(aClient());

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current?.initial).toBe('M');
  });

  it('uppercases an initial that was typed in lower case', () => {
    clientMock.mockReturnValue(aClient({ name: 'maria silva' }));

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current?.initial).toBe('M');
  });

  // An empty avatar reads as a rendering fault rather than as a blank name.
  it('falls back to a placeholder for a name that is only whitespace', () => {
    clientMock.mockReturnValue(aClient({ name: '   ' }));

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current?.initial).toBe(UNKNOWN_INITIAL);
  });

  it('passes the name and the email through untouched', () => {
    clientMock.mockReturnValue(aClient());

    const { result } = renderHook(() => useClientRowViewModel('client-1'));

    expect(result.current?.name).toBe('Maria Silva');
    expect(result.current?.email).toBe('maria@exemplo.pt');
  });
});

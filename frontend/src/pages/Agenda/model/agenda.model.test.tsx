import { renderHook } from '@testing-library/react';
import { AGENDA_QUERY, useAgendaModel } from './agenda.model';

const useQueryMock = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

function aQueryResult(overrides: { schedules?: unknown[]; loading?: boolean; error?: Error } = {}) {
  return {
    data:
      overrides.schedules === undefined
        ? { schedulesInRange: [{ id: 'schedule-1' }] }
        : { schedulesInRange: overrides.schedules },
    loading: overrides.loading ?? false,
    error: overrides.error,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useQueryMock.mockReturnValue(aQueryResult());
});

describe('useAgendaModel — one request, one month', () => {
  it('asks for the viewed month by year and month, and nothing else', () => {
    renderHook(() => useAgendaModel({ year: 2026, month: 9 }));

    expect(useQueryMock).toHaveBeenCalledWith(AGENDA_QUERY, {
      variables: { filter: { year: 2026, month: 9 } },
    });
  });

  it('carries the 1-based month the GraphQL filter wants, not a Date month index', () => {
    renderHook(() => useAgendaModel({ year: 2026, month: 1 }));

    expect(useQueryMock.mock.calls[0]?.[1].variables.filter.month).toBe(1);
  });

  it('does not page, because this field is not a connection', () => {
    renderHook(() => useAgendaModel({ year: 2026, month: 9 }));

    const options = useQueryMock.mock.calls[0]?.[1];

    expect(options).not.toHaveProperty('notifyOnNetworkStatusChange');
    expect(Object.keys(options)).toEqual(['variables']);
  });

  it('hands the schedules straight through', () => {
    const { result } = renderHook(() => useAgendaModel({ year: 2026, month: 9 }));

    expect(result.current.schedules).toEqual([{ id: 'schedule-1' }]);
  });

  it('reads a month with nothing in it as an empty list', () => {
    useQueryMock.mockReturnValue(aQueryResult({ schedules: [] }));

    const { result } = renderHook(() => useAgendaModel({ year: 2026, month: 9 }));

    expect(result.current.schedules).toEqual([]);
  });

  it('reads a request still in flight as an empty list rather than undefined', () => {
    useQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

    const { result } = renderHook(() => useAgendaModel({ year: 2026, month: 9 }));

    expect(result.current.schedules).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('passes a load failure up for the viewmodel to translate', () => {
    const error = new Error('boom');
    useQueryMock.mockReturnValue(aQueryResult({ error }));

    const { result } = renderHook(() => useAgendaModel({ year: 2026, month: 9 }));

    expect(result.current.error).toBe(error);
  });
});

import { renderHook } from '@testing-library/react';
import { DASHBOARD_QUERY, useDashboardModel } from './dashboard.model';

const useQueryMock = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

function aRow(id: string) {
  return { id, finalPrice: 10, tip: null };
}

const FULL_DATA = {
  selected: [aRow('selected')],
  prev1: [aRow('prev1')],
  prev2: [aRow('prev2')],
  prev3: [aRow('prev3')],
  prev4: [aRow('prev4')],
  prev5: [aRow('prev5')],
  pending: [{ id: 'pending-1' }, { id: 'pending-2' }],
};

const variablesOfLastCall = () => useQueryMock.mock.lastCall?.[1].variables;

beforeEach(() => {
  vi.clearAllMocks();
  useQueryMock.mockReturnValue({ data: FULL_DATA, loading: false, error: undefined });
});

describe('useDashboardModel — the request', () => {
  it('fires one query, and re-reads the network because cached lists cannot grow alone', () => {
    renderHook(() => useDashboardModel({ year: 2026, month: 10 }));

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    expect(useQueryMock.mock.calls[0]?.[0]).toBe(DASHBOARD_QUERY);
    expect(useQueryMock.mock.calls[0]?.[1].fetchPolicy).toBe('cache-and-network');
  });

  it('asks for the completed reservations of the selected month and the five before it', () => {
    renderHook(() => useDashboardModel({ year: 2026, month: 10 }));

    expect(variablesOfLastCall()).toMatchObject({
      selected: { year: 2026, month: 10, status: 'completed' },
      prev1: { year: 2026, month: 9, status: 'completed' },
      prev5: { year: 2026, month: 5, status: 'completed' },
    });
  });

  it('asks for the pending reservations of the selected month only', () => {
    renderHook(() => useDashboardModel({ year: 2026, month: 10 }));

    expect(variablesOfLastCall().pending).toEqual({ year: 2026, month: 10, status: 'pending' });
  });

  it('reaches back across New Year', () => {
    renderHook(() => useDashboardModel({ year: 2026, month: 1 }));

    expect(variablesOfLastCall()).toMatchObject({
      prev1: { year: 2025, month: 12 },
      prev5: { year: 2025, month: 8 },
    });
  });
});

describe('useDashboardModel — the result', () => {
  it('hides the aliases, handing the previous months back oldest first', () => {
    const { result } = renderHook(() => useDashboardModel({ year: 2026, month: 10 }));

    expect(result.current.previous.map(([row]) => row?.id)).toEqual([
      'prev5',
      'prev4',
      'prev3',
      'prev2',
      'prev1',
    ]);
    expect(result.current.selected).toEqual(FULL_DATA.selected);
  });

  it('counts the pending reservations', () => {
    const { result } = renderHook(() => useDashboardModel({ year: 2026, month: 10 }));

    expect(result.current.pendingCount).toBe(2);
  });

  it('reads no data as empty months and nothing pending', () => {
    useQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

    const { result } = renderHook(() => useDashboardModel({ year: 2026, month: 10 }));

    expect(result.current.selected).toEqual([]);
    expect(result.current.previous).toEqual([[], [], [], [], []]);
    expect(result.current.pendingCount).toBe(0);
  });

  it('is loading only when there is nothing to show yet', () => {
    useQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const first = renderHook(() => useDashboardModel({ year: 2026, month: 10 }));
    expect(first.result.current.isLoading).toBe(true);

    useQueryMock.mockReturnValue({ data: FULL_DATA, loading: true, error: undefined });
    const refreshing = renderHook(() => useDashboardModel({ year: 2026, month: 10 }));
    expect(refreshing.result.current.isLoading).toBe(false);
  });
});

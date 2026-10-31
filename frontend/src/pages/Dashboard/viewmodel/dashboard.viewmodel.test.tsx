import { renderHook } from '@testing-library/react';
import { monthRefOf } from '../../../lib/date/calendar';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { useDashboardViewModel } from './dashboard.viewmodel';

const modelMock = vi.fn();
const setSearchParamsMock = vi.fn();

let searchString = '';

vi.mock('../model/dashboard.model', () => ({
  useDashboardModel: (month: unknown) => modelMock(month),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(searchString), setSearchParamsMock] as const,
  };
});

const normalise = (value: string | undefined) => value?.replaceAll(' ', ' ');

const COMPLETED = {
  id: 'schedule-1',
  finalPrice: 40,
  tip: 5,
  user: { id: 'client-1', name: 'Ana' },
  service: { id: 'service-1', category: 'nails' },
  products: [
    { id: 'polish-1', name: 'Rouge', brand: 'Andreia', category: 'nails', color: '#75D2D5' },
  ],
};

function aModelState(overrides: Record<string, unknown> = {}) {
  return {
    selected: [COMPLETED],
    previous: [[], [], [], [], [{ id: 'old', finalPrice: 90, tip: null }]],
    pendingCount: 2,
    isLoading: false,
    error: undefined,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  searchString = '';
  modelMock.mockReturnValue(aModelState());
});

describe('useDashboardViewModel — the month', () => {
  it('shows the current month when the URL names none', () => {
    renderHook(() => useDashboardViewModel());

    expect(modelMock).toHaveBeenCalledWith(monthRefOf(new Date()));
  });

  it('uses the month in the URL', () => {
    searchString = '?mes=2026-03';

    const { result } = renderHook(() => useDashboardViewModel());

    expect(modelMock).toHaveBeenCalledWith({ year: 2026, month: 3 });
    expect(result.current.monthLabel).toBe('Março 2026');
  });

  it('falls back to the current month when the URL is malformed', () => {
    searchString = '?mes=nonsense';

    renderHook(() => useDashboardViewModel());

    expect(modelMock).toHaveBeenCalledWith(monthRefOf(new Date()));
  });

  it('moves between months in the URL, replacing the history entry', () => {
    searchString = '?mes=2026-03';

    const { result } = renderHook(() => useDashboardViewModel());

    result.current.goToPreviousMonth();
    expect(setSearchParamsMock).toHaveBeenLastCalledWith({ mes: '2026-02' }, { replace: true });

    result.current.goToNextMonth();
    expect(setSearchParamsMock).toHaveBeenLastCalledWith({ mes: '2026-04' }, { replace: true });
  });

  it('crosses a year boundary', () => {
    searchString = '?mes=2026-01';

    const { result } = renderHook(() => useDashboardViewModel());

    result.current.goToPreviousMonth();

    expect(setSearchParamsMock).toHaveBeenLastCalledWith({ mes: '2025-12' }, { replace: true });
  });
});

describe('useDashboardViewModel — the figures', () => {
  beforeEach(() => {
    searchString = '?mes=2026-10';
  });

  it('draws six bars, oldest first, with only the selected month marked', () => {
    const { result } = renderHook(() => useDashboardViewModel());

    expect(result.current.bars.map((bar) => bar.key)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ]);
    expect(result.current.bars.map((bar) => bar.isSelected)).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it('gives each bar its own month of revenue', () => {
    const { result } = renderHook(() => useDashboardViewModel());

    expect(normalise(result.current.bars[4]?.value)).toBe('90 €');
    expect(normalise(result.current.bars[5]?.value)).toBe('45 €');
  });

  it('agrees between the revenue KPI and the selected bar', () => {
    const { result } = renderHook(() => useDashboardViewModel());

    const revenue = result.current.kpis.find((kpi) => kpi.key === 'revenue');

    expect(normalise(revenue?.value)).toBe('45,00 €');
    expect(revenue?.label).toBe('RECEITA · OUTUBRO');
    expect(normalise(result.current.bars[5]?.spokenLabel)).toBe('Outubro 2026: 45,00 €');
  });

  it('builds the split and rankings from the selected month', () => {
    const { result } = renderHook(() => useDashboardViewModel());

    expect(result.current.split?.nailsPercent).toBe(100);
    expect(result.current.topClients.map((client) => client.name)).toEqual(['Ana']);
    expect(result.current.topPolishes.map((polish) => polish.label)).toEqual(['Andreia · Rouge']);
  });

  it('reads an empty month as nothing to divide or rank', () => {
    modelMock.mockReturnValue(aModelState({ selected: [] }));

    const { result } = renderHook(() => useDashboardViewModel());

    expect(result.current.split).toBeNull();
    expect(result.current.topClients).toEqual([]);
    expect(result.current.topPolishes).toEqual([]);
  });
});

describe('useDashboardViewModel — the request state', () => {
  it('turns an Apollo error into pt-PT copy, and never hands the error object over', () => {
    modelMock.mockReturnValue(aModelState({ error: new Error('boom') }));

    const { result } = renderHook(() => useDashboardViewModel());

    expect(result.current.loadError).toBe(DASHBOARD_COPY.load);
    expect(result.current).not.toHaveProperty('error');
  });

  it('has no error when the request succeeded', () => {
    const { result } = renderHook(() => useDashboardViewModel());

    expect(result.current.loadError).toBeNull();
  });

  it('passes the loading flag through', () => {
    modelMock.mockReturnValue(aModelState({ isLoading: true }));

    const { result } = renderHook(() => useDashboardViewModel());

    expect(result.current.isLoading).toBe(true);
  });
});

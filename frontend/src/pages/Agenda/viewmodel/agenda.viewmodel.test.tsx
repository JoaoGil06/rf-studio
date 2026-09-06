import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { useAgendaViewModel } from './agenda.viewmodel';

const modelMock = vi.fn();
const setSearchParamsMock = vi.fn();

vi.mock('../model/agenda.model', () => ({
  useAgendaModel: (month: unknown) => modelMock(month),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useSearchParams: () => {
      const params = new URLSearchParams(searchString);

      return [params, setSearchParamsMock] as const;
    },
  };
});

let searchString = '';

function aSchedule(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'schedule-1',
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    status: 'confirmed',
    finalPrice: 25,
    ...overrides,
  };
}

function aModelState(
  schedules: unknown[] = [],
  overrides: { error?: Error; loading?: boolean } = {},
) {
  return { schedules, loading: overrides.loading ?? false, error: overrides.error };
}

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

function renderViewModel(search = '?mes=2026-09', schedules: unknown[] = []) {
  searchString = search;
  modelMock.mockReturnValue(aModelState(schedules));

  return renderHook(() => useAgendaViewModel(), { wrapper });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  searchString = '';
  modelMock.mockReturnValue(aModelState());
});

describe('useAgendaViewModel — the month comes from the URL', () => {
  it('asks the model for the month the URL names', () => {
    renderViewModel('?mes=2026-09');

    expect(modelMock).toHaveBeenCalledWith({ year: 2026, month: 9 });
  });

  it('names that month in the headline', () => {
    const { result } = renderViewModel('?mes=2026-09');

    expect(result.current.monthLabel).toBe('Setembro 2026');
  });

  it('falls back to today’s month when the URL says nothing', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 9, 0));

    renderViewModel('');

    expect(modelMock).toHaveBeenCalledWith({ year: 2026, month: 9 });
  });

  it('falls back to today’s month when the URL says something unreadable', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 9, 0));

    renderViewModel('?mes=setembro');

    expect(modelMock).toHaveBeenCalledWith({ year: 2026, month: 9 });
  });
});

describe('useAgendaViewModel — stepping the month', () => {
  it('writes the next month and drops the day it belonged to', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12');

    result.current.goToNextMonth();

    expect(setSearchParamsMock).toHaveBeenCalledWith({ mes: '2026-10' }, { replace: true });
  });

  it('wraps December forward into the next January', () => {
    const { result } = renderViewModel('?mes=2026-12');

    result.current.goToNextMonth();

    expect(setSearchParamsMock).toHaveBeenCalledWith({ mes: '2027-01' }, { replace: true });
  });

  it('wraps January back into the previous December', () => {
    const { result } = renderViewModel('?mes=2026-01');

    result.current.goToPreviousMonth();

    expect(setSearchParamsMock).toHaveBeenCalledWith({ mes: '2025-12' }, { replace: true });
  });

  it('writes the month with the day when a day is chosen', () => {
    const { result } = renderViewModel('?mes=2026-09');

    result.current.selectDay('2026-09-15');

    expect(setSearchParamsMock).toHaveBeenCalledWith(
      { mes: '2026-09', dia: '2026-09-15' },
      { replace: true },
    );
  });
});

describe('useAgendaViewModel — the month grid', () => {
  it('lands a reservation in the bucket for its local day', () => {
    const { result } = renderViewModel('?mes=2026-09', [aSchedule()]);

    const twelfth = result.current.monthDays.find((day) => day.key === '2026-09-12');

    expect(twelfth?.reservationIds).toEqual(['schedule-1']);
    expect(twelfth?.count).toBe(1);
  });

  it('marks Sunday closed, since there is no closed-day model in the backend', () => {
    const { result } = renderViewModel('?mes=2026-09');

    // 6 September 2026 is a Sunday.
    expect(result.current.monthDays.find((day) => day.key === '2026-09-06')?.isClosed).toBe(true);
    expect(result.current.monthDays.find((day) => day.key === '2026-09-07')?.isClosed).toBe(false);
  });

  it('gives a day outside the month no ids at all', () => {
    const { result } = renderViewModel('?mes=2026-09', [
      aSchedule({ id: 'stray', date: new Date(2026, 7, 31, 10, 0).toISOString() }),
    ]);

    const stray = result.current.monthDays.find((day) => day.key === '2026-08-31');

    expect(stray?.isOutsideMonth).toBe(true);
    expect(stray?.reservationIds).toEqual([]);
  });

  it('caps a busy day at three marks and summarises the rest', () => {
    const { result } = renderViewModel(
      '?mes=2026-09',
      ['a', 'b', 'c', 'd', 'e'].map((id, index) =>
        aSchedule({ id, date: new Date(2026, 8, 12, 9 + index, 0).toISOString() }),
      ),
    );

    const twelfth = result.current.monthDays.find((day) => day.key === '2026-09-12');

    expect(twelfth?.reservationIds).toEqual(['a', 'b', 'c']);
    expect(twelfth?.overflow).toBe(2);
  });

  it('marks a cancelled reservation without counting it', () => {
    const { result } = renderViewModel('?mes=2026-09', [aSchedule({ status: 'cancelled' })]);

    const twelfth = result.current.monthDays.find((day) => day.key === '2026-09-12');

    expect(twelfth?.reservationIds).toEqual(['schedule-1']);
    expect(twelfth?.count).toBeNull();
  });

  it('sorts a day’s entries by the clock', () => {
    const { result } = renderViewModel('?mes=2026-09', [
      aSchedule({ id: 'late', date: new Date(2026, 8, 12, 16, 0).toISOString() }),
      aSchedule({ id: 'early', date: new Date(2026, 8, 12, 9, 0).toISOString() }),
    ]);

    expect(
      result.current.monthDays.find((day) => day.key === '2026-09-12')?.reservationIds,
    ).toEqual(['early', 'late']);
  });
});

describe('useAgendaViewModel — the week strip', () => {
  it('pages the month into whole weeks', () => {
    const { result } = renderViewModel('?mes=2026-09');

    expect(result.current.weeks).toHaveLength(5);
    expect(result.current.weeks[0]?.days).toHaveLength(7);
  });

  it('does not dot a cancelled reservation', () => {
    const { result } = renderViewModel('?mes=2026-09', [
      aSchedule({ id: 'live' }),
      aSchedule({ id: 'gone', status: 'cancelled' }),
    ]);

    const day = result.current.weeks
      .flatMap((week) => week.days)
      .find((candidate) => candidate.key === '2026-09-12');

    expect(day?.dots).toEqual(['confirmed']);
  });

  it('caps the dots at four', () => {
    const { result } = renderViewModel(
      '?mes=2026-09',
      ['a', 'b', 'c', 'd', 'e'].map((id, index) =>
        aSchedule({ id, date: new Date(2026, 8, 12, 9 + index, 0).toISOString() }),
      ),
    );

    const day = result.current.weeks
      .flatMap((week) => week.days)
      .find((candidate) => candidate.key === '2026-09-12');

    expect(day?.dots).toHaveLength(4);
  });
});

describe('useAgendaViewModel — the selected day', () => {
  it('opens at the day the URL names', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12');

    expect(result.current.selectedKey).toBe('2026-09-12');
    expect(result.current.dayLabel).toBe('sábado, 12 de Setembro');
  });

  it('opens at today when the URL names no day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 9, 0));

    const { result } = renderViewModel('?mes=2026-09');

    expect(result.current.selectedKey).toBe('2026-09-12');
  });

  it('opens at the first of the month when today is elsewhere', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 9, 0));

    const { result } = renderViewModel('?mes=2026-11');

    expect(result.current.selectedKey).toBe('2026-11-01');
  });

  it('ignores a day that belongs to another month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 12, 9, 0));

    const { result } = renderViewModel('?mes=2026-09&dia=2026-11-04');

    expect(result.current.selectedKey).toBe('2026-09-12');
  });

  it('lays the studio day out in half hours whether or not anything is booked', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12');

    expect(result.current.daySlots).toHaveLength(14);
    expect(result.current.daySlots[0]?.time).toBe('09:00');
    expect(result.current.daySlots.at(-1)?.time).toBe('17:30');
  });

  it('files a reservation into the slot for its hour', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [aSchedule()]);

    const ten = result.current.daySlots.find((slot) => slot.time === '10:00');

    expect(ten?.reservationIds).toEqual(['schedule-1']);
  });

  it('adds a slot the studio grid does not have', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [
      aSchedule({ date: new Date(2026, 8, 12, 13, 0).toISOString() }),
    ]);

    const times = result.current.daySlots.map((slot) => slot.time);

    expect(times).toHaveLength(15);
    expect(times.indexOf('13:00')).toBe(times.indexOf('11:30') + 1);
  });

  it('counts what the day holds, in tracked capitals', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [
      aSchedule({ id: 'a' }),
      aSchedule({ id: 'b', date: new Date(2026, 8, 12, 11, 0).toISOString() }),
    ]);

    expect(result.current.dayCountLabel).toBe('2 RESERVAS');
  });

  it('says so when a day holds nothing', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-15');

    expect(result.current.dayCountLabel).toBe('SEM RESERVAS');
  });

  it('says FECHADO on a Sunday, and reports it closed', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-06');

    expect(result.current.dayCountLabel).toBe('FECHADO');
    expect(result.current.isSelectedDayClosed).toBe(true);
  });
});

describe('useAgendaViewModel — the month stats', () => {
  const MONTH = [
    aSchedule({ id: 'a', status: 'completed', finalPrice: 30 }),
    aSchedule({ id: 'b', status: 'completed', finalPrice: 20.5 }),
    aSchedule({ id: 'c', status: 'pending', finalPrice: 15 }),
    aSchedule({ id: 'd', status: 'cancelled', finalPrice: 40 }),
  ];

  it('counts every reservation but the cancelled ones', () => {
    const { result } = renderViewModel('?mes=2026-09', MONTH);

    expect(result.current.stats.reservations).toBe('3');
  });

  it('counts what is waiting on an answer', () => {
    const { result } = renderViewModel('?mes=2026-09', MONTH);

    expect(result.current.stats.pending).toBe('1');
  });

  it('sums the final price of completed reservations only', () => {
    const { result } = renderViewModel('?mes=2026-09', MONTH);

    expect(result.current.stats.revenue).toBe(
      new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }).format(50.5),
    );
  });

  it('reports an empty month as zeroes rather than as nothing', () => {
    const { result } = renderViewModel('?mes=2026-09');

    expect(result.current.stats.reservations).toBe('0');
    expect(result.current.hasReservations).toBe(false);
  });
});

describe('useAgendaViewModel — the legend and the load failure', () => {
  it('carries the four states in lifecycle order', () => {
    const { result } = renderViewModel('?mes=2026-09');

    expect(result.current.statuses.map((status) => status.value)).toEqual([
      'pending',
      'confirmed',
      'completed',
      'cancelled',
    ]);
  });

  it('translates a load failure into pt-PT rather than handing the View an error', () => {
    searchString = '?mes=2026-09';
    modelMock.mockReturnValue(aModelState([], { error: new Error('boom') }));

    const { result } = renderHook(() => useAgendaViewModel(), { wrapper });

    expect(result.current.loadError).toBe(SCHEDULE_ERROR_MESSAGES.load);
  });

  it('reports no error when there is none', () => {
    const { result } = renderViewModel('?mes=2026-09');

    expect(result.current.loadError).toBeNull();
  });
});

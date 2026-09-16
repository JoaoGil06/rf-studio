import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { BOOKING_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
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
    service: { durationMinutes: 30 },
    ...overrides,
  };
}

function aClient(id: string, name: string) {
  return { node: { id, name } };
}

function aService(id: string, name: string, category: string, price: number, durationMinutes = 30) {
  return { node: { id, name, category, price, durationMinutes } };
}

interface ModelOverrides {
  error?: Error;
  loading?: boolean;
  clients?: unknown[];
  services?: unknown[];
  hasMoreClients?: boolean;
}

function aModelState(schedules: unknown[] = [], overrides: ModelOverrides = {}) {
  return {
    schedules,
    clients: overrides.clients ?? [],
    hasMoreClients: overrides.hasMoreClients ?? false,
    services: overrides.services ?? [],
    loading: overrides.loading ?? false,
    error: overrides.error,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

function renderViewModel(
  search = '?mes=2026-09',
  schedules: unknown[] = [],
  overrides: ModelOverrides = {},
) {
  searchString = search;
  modelMock.mockReturnValue(aModelState(schedules, overrides));

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

    expect(result.current.daySlots).toHaveLength(27);
    expect(result.current.daySlots[0]?.time).toBe('09:00');
    expect(result.current.daySlots.at(-1)?.time).toBe('22:00');
  });

  it('keeps the lunch hours in the day', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12');

    const times = result.current.daySlots.map((slot) => slot.time);

    expect(times.slice(times.indexOf('11:30'), times.indexOf('14:00') + 1)).toEqual([
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
    ]);
  });

  it('files a reservation into the slot for its hour', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [aSchedule()]);

    const ten = result.current.daySlots.find((slot) => slot.time === '10:00');

    expect(ten?.reservationIds).toEqual(['schedule-1']);
  });

  it('marks the hours a long service runs through, so the pane never calls them free', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [
      aSchedule({ service: { durationMinutes: 90 } }),
    ]);

    const at = (time: string) => result.current.daySlots.find((slot) => slot.time === time);

    expect(at('10:00')?.isCovered).toBe(false);
    expect(at('10:30')?.isCovered).toBe(true);
    expect(at('11:00')?.isCovered).toBe(true);
    expect(at('11:30')?.isCovered).toBe(false);
  });

  it('leaves a cancelled reservation covering nothing at all', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [
      aSchedule({ status: 'cancelled', service: { durationMinutes: 90 } }),
    ]);

    expect(result.current.daySlots.find((slot) => slot.time === '10:30')?.isCovered).toBe(false);
  });

  it('adds a slot the studio grid does not have', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12', [
      aSchedule({ date: new Date(2026, 8, 12, 13, 15).toISOString() }),
    ]);

    const times = result.current.daySlots.map((slot) => slot.time);

    expect(times).toHaveLength(28);
    expect(times.indexOf('13:15')).toBe(times.indexOf('13:00') + 1);
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

describe('useAgendaViewModel — the booking pickers', () => {
  it('sorts the client picker by name in pt-PT collation, not by creation order', () => {
    const { result } = renderViewModel('?mes=2026-09', [], {
      clients: [aClient('c1', 'Zulmira'), aClient('c2', 'Ângela'), aClient('c3', 'Ana')],
    });

    expect(result.current.clientOptions.map((option) => option.name)).toEqual([
      'Ana',
      'Ângela',
      'Zulmira',
    ]);
  });

  it('groups services under their category title and drops an empty category', () => {
    const { result } = renderViewModel('?mes=2026-09', [], {
      services: [aService('s1', 'Manicure', 'nails', 15)],
    });

    expect(result.current.serviceGroups).toHaveLength(1);
    expect(result.current.serviceGroups[0]?.label).toBe('Unhas');
  });

  it('writes the price beside the service name, so two similar names read apart', () => {
    const { result } = renderViewModel('?mes=2026-09', [], {
      services: [aService('s1', 'Manicure', 'nails', 15)],
    });

    expect(result.current.serviceGroups[0]?.options[0]?.label).toBe('Manicure · 15,00 €');
  });

  it('reports the truncation note only when the book ran past one page', () => {
    const whole = renderViewModel('?mes=2026-09', [], { hasMoreClients: false });

    expect(whole.result.current.clientsTruncatedNote).toBeNull();

    const truncated = renderViewModel('?mes=2026-09', [], { hasMoreClients: true });

    expect(truncated.result.current.clientsTruncatedNote).toBe(BOOKING_COPY.clientsTruncated);
  });
});

describe('useAgendaViewModel — the bookable days', () => {
  it('hands the sheet the spans the day already holds, not just their start times', () => {
    const { result } = renderViewModel('?mes=2026-09', [
      aSchedule({ service: { durationMinutes: 90 } }),
    ]);

    const day = result.current.bookingDays['2026-09-12'];

    expect(day?.label).toBe('sábado, 12 de Setembro');
    expect(day?.addLabel).toBe(`${BOOKING_COPY.addOn} sábado, 12 de Setembro`);
    // 10:00 for an hour and a half, so the chair is held until 11:30.
    expect(day?.busy).toEqual([{ startMinutes: 10 * 60, endMinutes: 11 * 60 + 30 }]);
  });

  it('holds an off-grid hour too — 13:00 is a real thing Rita can have booked', () => {
    const { result } = renderViewModel('?mes=2026-09', [
      aSchedule({ date: new Date(2026, 8, 12, 13, 0).toISOString() }),
    ]);

    expect(result.current.bookingDays['2026-09-12']?.busy).toEqual([
      { startMinutes: 13 * 60, endMinutes: 13 * 60 + 30 },
    ]);
  });

  it('does not let a cancelled reservation hold its hour', () => {
    const { result } = renderViewModel('?mes=2026-09', [aSchedule({ status: 'cancelled' })]);

    expect(result.current.bookingDays['2026-09-12']?.busy).toEqual([]);
  });

  it('holds one grid slot for a reservation whose service lost its duration', () => {
    const { result } = renderViewModel('?mes=2026-09', [
      aSchedule({ service: { durationMinutes: 0 } }),
    ]);

    expect(result.current.bookingDays['2026-09-12']?.busy).toEqual([
      { startMinutes: 10 * 60, endMinutes: 10 * 60 + 30 },
    ]);
  });

  it('offers no booking day for a closed day or a day outside the month', () => {
    const { result } = renderViewModel('?mes=2026-09');

    // 13 September 2026 is a Sunday; 31 August rides in the grid from the month before.
    expect(result.current.bookingDays['2026-09-13']).toBeUndefined();
    expect(result.current.bookingDays['2026-08-31']).toBeUndefined();
  });

  it('names the day the pane is open at, so the pane head can book it', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-12');

    expect(result.current.selectedBookingDay?.key).toBe('2026-09-12');
  });

  it('offers the pane nothing to book when the selected day is closed', () => {
    const { result } = renderViewModel('?mes=2026-09&dia=2026-09-13');

    expect(result.current.selectedBookingDay).toBeNull();
  });

  it('names a bookable month cell by its booking label and leaves a closed one unnamed', () => {
    const { result } = renderViewModel('?mes=2026-09');

    const saturday = result.current.monthDays.find((day) => day.key === '2026-09-12');
    const sunday = result.current.monthDays.find((day) => day.key === '2026-09-13');

    expect(saturday?.canAdd).toBe(true);
    expect(saturday?.addLabel).toBe(`${BOOKING_COPY.addOn} sábado, 12 de Setembro`);
    expect(sunday?.canAdd).toBe(false);
    expect(sunday?.addLabel).toBe('');
  });
});

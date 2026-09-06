import { renderHook } from '@testing-library/react';
import type { ReservationEntryFieldsFragment } from '../../../graphql/generated/graphql';
import { useReservationEntryViewModel } from './reservationEntry.viewmodel';

const reservationMock = vi.fn();

vi.mock('../model/reservationEntry.model', () => ({
  useReservationEntryModel: () => ({ reservation: reservationMock() }),
}));

function aReservation(
  overrides: Partial<ReservationEntryFieldsFragment> = {},
): ReservationEntryFieldsFragment {
  return {
    id: 'schedule-1',
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    status: 'confirmed',
    user: { id: 'client-1', name: 'Ana Sofia Martins' },
    service: { id: 'service-1', name: 'Manicure simples', category: 'nails' },
    ...overrides,
  } as ReservationEntryFieldsFragment;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useReservationEntryViewModel — the label', () => {
  it('returns null while the fragment is missing from the cache', () => {
    reservationMock.mockReturnValue(null);

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'dense'));

    expect(result.current).toBeNull();
  });

  it('leads with the category and the first name, and prefixes the hour when dense', () => {
    reservationMock.mockReturnValue(aReservation());

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'dense'));

    expect(result.current?.label).toBe('10:00 Unhas · Ana');
  });

  it('drops the hour at reading density', () => {
    reservationMock.mockReturnValue(aReservation());

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'read'));

    expect(result.current?.label).toBe('Unhas · Ana');
  });

  it('leads a pending entry with its state instead of its category', () => {
    reservationMock.mockReturnValue(aReservation({ status: 'pending' }));

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'read'));

    expect(result.current?.label).toBe('Pendente · Ana');
  });

  it('writes the category as a word, not as the tab tracked capitals', () => {
    reservationMock.mockReturnValue(
      aReservation({ service: { id: 'service-2', name: 'Design', category: 'eyebrows' } }),
    );

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'read'));

    expect(result.current?.label).toBe('Sobrancelhas · Ana');
  });

  it('labels a cancelled entry like any other', () => {
    reservationMock.mockReturnValue(aReservation({ status: 'cancelled' }));

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'dense'));

    expect(result.current?.label).toBe('10:00 Unhas · Ana');
    expect(result.current?.statusValue).toBe('cancelled');
  });
});

describe('useReservationEntryViewModel — the accessible name', () => {
  it('spells out the date, the hour, the state and the whole name of the client', () => {
    reservationMock.mockReturnValue(aReservation());

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'dense'));

    expect(result.current?.description).toBe(
      'Reserva de sábado, 12 de Setembro de 2026 às 10:00 — Confirmada, Ana Sofia Martins',
    );
  });

  it('says the same thing at both densities, since only the visible mark shortens', () => {
    reservationMock.mockReturnValue(aReservation());

    const dense = renderHook(() => useReservationEntryViewModel('schedule-1', 'dense'));
    const read = renderHook(() => useReservationEntryViewModel('schedule-1', 'read'));

    expect(dense.result.current?.description).toBe(read.result.current?.description);
  });
});

describe('useReservationEntryViewModel — an hour outside the studio grid', () => {
  it('reports 13:00 as itself rather than snapping it to a slot', () => {
    reservationMock.mockReturnValue(
      aReservation({ date: new Date(2026, 8, 12, 13, 0).toISOString() }),
    );

    const { result } = renderHook(() => useReservationEntryViewModel('schedule-1', 'dense'));

    expect(result.current?.label).toBe('13:00 Unhas · Ana');
  });
});

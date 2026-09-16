import { renderHook } from '@testing-library/react';
import type { ReservationRowFieldsFragment } from '../../../graphql/generated/graphql';
import { formatEuros } from '../../../lib/format/money';
import { useReservationRowViewModel } from './reservationRow.viewmodel';

const reservationMock = vi.fn();

vi.mock('../model/reservationRow.model', () => ({
  useReservationRowModel: () => ({ reservation: reservationMock() }),
}));

const SEPTEMBER_12_AT_10 = new Date(2026, 8, 12, 10, 0).toISOString();

function aReservation(
  overrides: Partial<Omit<ReservationRowFieldsFragment, ' $fragmentName'>> = {},
) {
  return {
    id: 'schedule-1',
    date: SEPTEMBER_12_AT_10,
    status: 'pending' as const,
    finalPrice: 35,
    user: { id: 'client-1', name: 'Maria Silva' },
    service: { id: 'service-1', name: 'Gel', category: 'nails' as const },
    ...overrides,
  };
}

function renderRow() {
  return renderHook(() => useReservationRowViewModel('schedule-1'));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 16));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useReservationRowViewModel', () => {
  it('returns null while the fragment is missing from the cache', () => {
    reservationMock.mockReturnValue(null);

    expect(renderRow().result.current).toBeNull();
  });

  it('names a pending reservation by client and category, with no price', () => {
    reservationMock.mockReturnValue(aReservation());

    const { result } = renderRow();

    expect(result.current?.statusValue).toBe('pending');
    expect(result.current?.statusLabel).toBe('Pendente');
    expect(result.current?.title).toBe('Maria Silva · Unhas');
  });

  it('carries no price on a confirmed reservation either — it would read as a quote', () => {
    reservationMock.mockReturnValue(aReservation({ status: 'confirmed' }));

    const { result } = renderRow();

    expect(result.current?.statusLabel).toBe('Confirmada');
    expect(result.current?.title).toBe('Maria Silva · Unhas');
  });

  it('appends the settled price once the reservation is concluded', () => {
    reservationMock.mockReturnValue(aReservation({ status: 'completed' }));

    const { result } = renderRow();

    expect(result.current?.title).toBe(`Maria Silva · Unhas · ${formatEuros(35) ?? ''}`);
  });

  it('names the brows category by its title', () => {
    reservationMock.mockReturnValue(
      aReservation({ service: { id: 'service-2', name: 'Design', category: 'eyebrows' } }),
    );

    expect(renderRow().result.current?.title).toBe('Maria Silva · Sobrancelhas');
  });

  it('drops an unknown category rather than printing undefined or a doubled separator', () => {
    reservationMock.mockReturnValue(
      aReservation({
        service: {
          id: 'service-3',
          name: 'Outro',
          category: 'lashes' as unknown as ReservationRowFieldsFragment['service']['category'],
        },
      }),
    );

    expect(renderRow().result.current?.title).toBe('Maria Silva');
  });

  it('reads the date and hour as the prototype does, without the current year', () => {
    reservationMock.mockReturnValue(aReservation());

    expect(renderRow().result.current?.when).toBe('12 Setembro · 10:00');
  });

  it('carries the year when the reservation is from another year', () => {
    reservationMock.mockReturnValue(
      aReservation({ date: new Date(2025, 8, 12, 10, 0).toISOString() }),
    );

    expect(renderRow().result.current?.when).toBe('12 Setembro 2025 · 10:00');
  });

  it('passes the service name through untouched', () => {
    reservationMock.mockReturnValue(aReservation());

    expect(renderRow().result.current?.serviceName).toBe('Gel');
  });

  it('describes the whole row in one sentence for assistive tech', () => {
    reservationMock.mockReturnValue(aReservation());

    expect(renderRow().result.current?.description).toBe(
      'Pendente — Maria Silva · Unhas, Gel, sábado, 12 de Setembro de 2026 às 10:00',
    );
  });
});

import { renderHook } from '@testing-library/react';
import type { ServiceCardFieldsFragment } from '../../../graphql/generated/graphql';
import { UNKNOWN_PRICE, useServiceCardViewModel } from './serviceCard.viewmodel';

const serviceMock = vi.fn();

vi.mock('../model/serviceCard.model', () => ({
  useServiceCardModel: () => ({ service: serviceMock() }),
}));

type ServiceOverrides = Partial<Omit<ServiceCardFieldsFragment, 'category'>> & {
  category?: string;
};

function aService(overrides: ServiceOverrides = {}) {
  return {
    id: 'service-1',
    name: 'Manicure simples',
    category: 'nails',
    price: 15,
    durationMinutes: 45,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useServiceCardViewModel', () => {
  it('returns null while the fragment is missing from the cache', () => {
    serviceMock.mockReturnValue(null);

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current).toBeNull();
  });

  it('puts the category and the duration in the tracked meta line', () => {
    serviceMock.mockReturnValue(aService());

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.metaLabel).toBe('UNHAS · 45 MIN');
  });

  it('formats the price in euros', () => {
    serviceMock.mockReturnValue(aService());

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.price).toMatch(/^15,00\s€$/);
  });

  it('maps the eyebrows wire value to the SOBRANCELHAS label', () => {
    serviceMock.mockReturnValue(aService({ category: 'eyebrows' }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.metaLabel).toBe('SOBRANCELHAS · 45 MIN');
  });

  it('uppercases an hours-and-minutes duration', () => {
    serviceMock.mockReturnValue(aService({ durationMinutes: 90 }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.metaLabel).toBe('UNHAS · 1 H 30');
  });

  it('drops an unknown category rather than rendering "undefined ·"', () => {
    serviceMock.mockReturnValue(aService({ category: 'lashes' }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.metaLabel).toBe('45 MIN');
  });

  it('drops a duration the formatter rejected rather than losing the whole line', () => {
    serviceMock.mockReturnValue(aService({ durationMinutes: 0 }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.metaLabel).toBe('UNHAS');
  });

  it('shows a dash rather than "NaN €" for a price that is not one', () => {
    serviceMock.mockReturnValue(aService({ price: Number.NaN }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.price).toBe(UNKNOWN_PRICE);
  });

  it('takes the initial from the name, uppercased', () => {
    serviceMock.mockReturnValue(aService({ name: 'pedicure completa' }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.initial).toBe('P');
  });

  it('falls back to a question mark when the name is blank', () => {
    serviceMock.mockReturnValue(aService({ name: '   ' }));

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.initial).toBe('?');
  });

  it('names both actions after the service', () => {
    serviceMock.mockReturnValue(aService());

    const { result } = renderHook(() => useServiceCardViewModel('service-1'));

    expect(result.current?.editLabel).toBe('Editar Manicure simples');
    expect(result.current?.deleteLabel).toBe('Remover Manicure simples');
  });
});

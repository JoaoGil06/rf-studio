import { CombinedGraphQLErrors } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { formatEuros } from '../../../lib/format/money';
import { COMPLETE_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import type { ProductOption } from '../../ProductPicker/types/productPicker.types';
import { useCompleteReservationModalViewModel } from './completeReservationModal.viewmodel';

const completeScheduleMock = vi.fn();
const reservationMock = vi.fn();

vi.mock('../model/completeReservationModal.model', () => ({
  useCompleteReservationModalModel: () => ({
    reservation: reservationMock(),
    completeSchedule: completeScheduleMock,
    isSaving: false,
  }),
}));

function aReservation(category = 'nails') {
  return {
    id: 's1',
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    finalPrice: 35,
    user: { id: 'client-1', name: 'Maria Silva' },
    service: { id: 'service-1', name: 'Manicure', category },
  };
}

function anOption(id: string, brand: string, category = 'nails'): ProductOption {
  return { id, name: `Produto ${id}`, brand, category, swatchColour: null, tone: null };
}

const OPTIONS = [
  anOption('a1', 'Andreia'),
  anOption('k1', 'Kelly K'),
  anOption('a2', 'Andreia'),
  anOption('b1', 'Brows', 'eyebrows'),
];

function aPayload(completeSchedule: Record<string, unknown>) {
  return { data: { completeSchedule } };
}

function renderViewModel(
  options: readonly ProductOption[] = OPTIONS,
  hasMoreProducts = false,
  isLoadingProducts = false,
) {
  return renderHook(() =>
    useCompleteReservationModalViewModel('s1', options, hasMoreProducts, isLoadingProducts),
  );
}

const VALUES = { productIds: ['a1'], tip: null };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 16));
  reservationMock.mockReturnValue(aReservation());
  completeScheduleMock.mockResolvedValue(aPayload({ __typename: 'CompleteScheduleSuccess' }));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCompleteReservationModalViewModel — what the sheet says', () => {
  it('names the day, the hour, the client and the service', () => {
    const { result } = renderViewModel();

    expect(result.current.title).toBe('12 Setembro às 10:00');
    expect(result.current.subject).toBe('Maria Silva · Manicure');
  });

  it('has no title while the fragment is missing', () => {
    reservationMock.mockReturnValue(null);

    expect(renderViewModel().result.current.title).toBeNull();
  });

  it('totals the service alone with no tip', () => {
    expect(renderViewModel().result.current.total).toBe(formatEuros(35));
  });
});

describe('useCompleteReservationModalViewModel — choosing products', () => {
  it('offers only the reservation’s category, grouped by brand', () => {
    const { result } = renderViewModel();

    expect(
      result.current.groups.map((group) => [group.label, group.options.map(({ id }) => id)]),
    ).toEqual([
      ['Andreia', ['a1', 'a2']],
      ['Kelly K', ['k1']],
    ]);
  });

  it('moves a choice from the select to the chosen list, and back', () => {
    const { result } = renderViewModel();

    act(() => result.current.addProduct('k1'));

    expect(result.current.chosen.map(({ id }) => id)).toEqual(['k1']);
    expect(result.current.groups.map((group) => group.label)).toEqual(['Andreia']);

    act(() => result.current.removeProduct('k1'));

    expect(result.current.chosen).toEqual([]);
    expect(result.current.groups.map((group) => group.label)).toEqual(['Andreia', 'Kelly K']);
  });

  it('does not add the same product twice, or the placeholder', () => {
    const { result } = renderViewModel();

    act(() => result.current.addProduct('a1'));
    act(() => result.current.addProduct('a1'));
    act(() => result.current.addProduct(''));

    expect(result.current.chosen.map(({ id }) => id)).toEqual(['a1']);
  });
});

describe('useCompleteReservationModalViewModel — when the list is short', () => {
  it('says so by category when no product exists', () => {
    reservationMock.mockReturnValue(aReservation('eyebrows'));

    const { result } = renderViewModel([]);

    expect(result.current.isPickerEmpty).toBe(true);
    expect(result.current.note).toBe(COMPLETE_COPY.noProducts('Sobrancelhas'));
  });

  it('never reads loading as having no products', () => {
    const { result } = renderViewModel([], false, true);

    expect(result.current.isPickerEmpty).toBe(false);
    expect(result.current.note).toBeNull();
  });

  it('does not call a partial list empty', () => {
    const { result } = renderViewModel([], true);

    expect(result.current.isPickerEmpty).toBe(false);
    expect(result.current.note).toBe(COMPLETE_COPY.partialProducts);
  });

  it('says nothing when the list is whole', () => {
    expect(renderViewModel().result.current.note).toBeNull();
  });
});

describe('useCompleteReservationModalViewModel — submitting', () => {
  const submitWith = async (result: ReturnType<typeof renderViewModel>['result']) => {
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.submit(VALUES);
    });
    return outcome;
  };

  it('sends the reservation, the products and the tip', async () => {
    const { result } = renderViewModel();

    await act(async () => {
      await result.current.submit({ productIds: ['a1', 'k1'], tip: 5 });
    });

    expect(completeScheduleMock).toHaveBeenCalledWith({
      variables: { input: { scheduleId: 's1', productIds: ['a1', 'k1'], tip: 5 } },
    });
  });

  it('sends no tip as null', async () => {
    const { result } = renderViewModel();

    await submitWith(result);

    expect(completeScheduleMock).toHaveBeenCalledWith({
      variables: { input: { scheduleId: 's1', productIds: ['a1'], tip: null } },
    });
  });

  it('reports success', async () => {
    const { result } = renderViewModel();

    expect(await submitWith(result)).toBe(true);
    expect(result.current.formError).toBeNull();
  });

  it.each([
    ['ScheduleNotFoundError', SCHEDULE_ERROR_MESSAGES.notFound],
    ['ServiceNotFoundError', SCHEDULE_ERROR_MESSAGES.serviceNotFound],
    ['ScheduleNotCompletableError', SCHEDULE_ERROR_MESSAGES.statusChanged],
    ['ProductNotFoundError', SCHEDULE_ERROR_MESSAGES.productNotFound],
  ])('maps %s to pt-PT copy and reports failure', async (__typename, message) => {
    completeScheduleMock.mockResolvedValue(aPayload({ __typename, message: 'in English' }));
    const { result } = renderViewModel();

    expect(await submitWith(result)).toBe(false);
    expect(result.current.formError).toBe(message);
  });

  it('clears the chosen products when one of them no longer exists', async () => {
    completeScheduleMock.mockResolvedValue(
      aPayload({ __typename: 'ProductNotFoundError', message: 'Product not found' }),
    );
    const { result } = renderViewModel();
    act(() => result.current.addProduct('a1'));

    await submitWith(result);

    expect(result.current.chosen).toEqual([]);
  });

  it('reports a missing result as a network failure', async () => {
    completeScheduleMock.mockResolvedValue({ data: undefined });
    const { result } = renderViewModel();

    expect(await submitWith(result)).toBe(false);
    expect(result.current.formError).toBe(SCHEDULE_ERROR_MESSAGES.network);
  });

  it.each([
    [
      'a BAD_USER_INPUT rejection',
      new CombinedGraphQLErrors({
        errors: [{ message: 'mismatch', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
      SCHEDULE_ERROR_MESSAGES.badInput,
    ],
    [
      'another server rejection',
      new CombinedGraphQLErrors({ errors: [{ message: 'boom' }] }),
      SCHEDULE_ERROR_MESSAGES.completeFailed,
    ],
    ['a network failure', new Error('Failed to fetch'), SCHEDULE_ERROR_MESSAGES.network],
  ])('maps %s without ever showing Apollo’s message', async (_name, error, message) => {
    completeScheduleMock.mockRejectedValue(error);
    const { result } = renderViewModel();

    expect(await submitWith(result)).toBe(false);
    expect(result.current.formError).toBe(message);
  });
});

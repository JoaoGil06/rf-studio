import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCache } from '../../../graphql/cache';
import { formatEuros } from '../../../lib/format/money';
import { COMPLETE_COPY } from '../../../utils/constants/scheduleMessages';
import {
  COMPLETE_RESERVATION_FRAGMENT,
  COMPLETE_RESERVATION_MUTATION,
} from '../model/completeReservationModal.model';
import { CompleteReservationModal } from './completeReservationModal.view';

const OPTIONS = [
  {
    id: 'p1',
    name: 'Andreia 201',
    brand: 'Andreia',
    category: 'nails',
    swatchColour: '#75D2D5',
    tone: null,
  },
];

const RESERVATION = {
  __typename: 'Schedule' as const,
  id: 's1',
  date: new Date(2026, 8, 12, 10, 0).toISOString(),
  finalPrice: 45,
  user: { __typename: 'User' as const, id: 'client-1', name: 'Maria Silva' },
  service: {
    __typename: 'Service' as const,
    id: 'service-1',
    name: 'Manicure',
    category: 'nails' as const,
  },
};

function aSeededCache() {
  const cache = createCache();

  cache.writeFragment({
    id: 'Schedule:s1',
    fragment: COMPLETE_RESERVATION_FRAGMENT,
    fragmentName: 'CompleteReservationFields',
    data: RESERVATION,
  });

  return cache;
}

function aMutationMock(tip: number | null, payload: Record<string, unknown>): MockedResponse {
  return {
    request: {
      query: COMPLETE_RESERVATION_MUTATION,
      variables: { input: { scheduleId: 's1', productIds: ['p1'], tip } },
    },
    result: () => {
      mutationSpy(tip);
      return { data: { completeSchedule: payload } };
    },
  };
}

const SUCCESS = {
  __typename: 'CompleteScheduleSuccess',
  schedule: { __typename: 'Schedule', id: 's1', status: 'completed', tip: null, finalPrice: 45 },
};

const mutationSpy = vi.fn();
const onClose = vi.fn();

function renderModal(
  mocks: MockedResponse[] = [],
  {
    options = OPTIONS,
    isLoadingProducts = false,
    cache = aSeededCache(),
  }: {
    options?: typeof OPTIONS;
    isLoadingProducts?: boolean;
    cache?: ReturnType<typeof createCache>;
  } = {},
) {
  return render(
    <MockedProvider mocks={mocks} cache={cache}>
      <CompleteReservationModal
        scheduleId="s1"
        productOptions={options}
        hasMoreProducts={false}
        isLoadingProducts={isLoadingProducts}
        onClose={onClose}
      />
    </MockedProvider>,
  );
}

/** `formatEuros` uses a no-break space, which Testing Library normalises to a plain one. */
const euros = (amount: number) =>
  (formatEuros(amount) ?? '').replaceAll(String.fromCharCode(0xa0), ' ');

const productSelect = () => screen.getByLabelText(COMPLETE_COPY.productsLabel);
const tipField = () => screen.getByLabelText(COMPLETE_COPY.tipLabel);
const submitButton = () => screen.getByRole('button', { name: COMPLETE_COPY.submit });

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 16));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CompleteReservationModal', () => {
  it('renders nothing while the reservation cannot be read', () => {
    renderModal([], { cache: createCache() });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on the day, the client, the consequence and the total', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: /12 Setembro às 10:00/ })).toBeInTheDocument();
    expect(screen.getByText('Maria Silva · Manicure')).toBeInTheDocument();
    expect(screen.getByText(COMPLETE_COPY.consequence)).toBeInTheDocument();
    expect(screen.getByText(euros(45))).toBeInTheDocument();
  });

  it('closes on VOLTAR without sending anything', async () => {
    renderModal([aMutationMock(null, SUCCESS)]);

    await userEvent.setup().click(screen.getByRole('button', { name: COMPLETE_COPY.keep }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mutationSpy).not.toHaveBeenCalled();
  });

  it('refuses to send no products, and clears the error on the add that fixes it', async () => {
    renderModal([aMutationMock(null, SUCCESS)]);
    const user = userEvent.setup();

    await user.click(submitButton());

    const message = 'Associe pelo menos 1 produto para concluir.';
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(mutationSpy).not.toHaveBeenCalled();

    await user.selectOptions(productSelect(), 'p1');

    await vi.waitFor(() => expect(screen.queryByText(message)).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Remover Andreia 201' })).toBeInTheDocument();
  });

  it('sends an empty tip as null, then closes', async () => {
    renderModal([aMutationMock(null, SUCCESS)]);
    const user = userEvent.setup();

    await user.selectOptions(productSelect(), 'p1');
    await user.click(submitButton());

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mutationSpy).toHaveBeenCalledWith(null);
  });

  it('sends a typed tip as a number, and adds it to the total', async () => {
    renderModal([aMutationMock(5.5, SUCCESS)]);
    const user = userEvent.setup();

    await user.selectOptions(productSelect(), 'p1');
    await user.type(tipField(), '5.5');

    expect(screen.getByText(euros(50.5))).toBeInTheDocument();

    await user.click(submitButton());

    await vi.waitFor(() => expect(mutationSpy).toHaveBeenCalledWith(5.5));
  });

  it.each([
    ['-1', 'A gorjeta não pode ser negativa.'],
    ['5.555', 'Use no máximo dois decimais.'],
  ])('refuses a tip of %s', async (typed, message) => {
    renderModal();
    const user = userEvent.setup();

    await user.selectOptions(productSelect(), 'p1');
    await user.type(tipField(), typed);
    await user.click(submitButton());

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(tipField()).toHaveAttribute('aria-invalid', 'true');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays open and announces a refusal', async () => {
    renderModal([
      aMutationMock(null, {
        __typename: 'ScheduleNotCompletableError',
        message: 'Schedule already completed',
      }),
    ]);
    const user = userEvent.setup();

    await user.selectOptions(productSelect(), 'p1');
    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(/já tinha mudado de estado/);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('holds both buttons while the request is in flight', async () => {
    renderModal([{ ...aMutationMock(null, SUCCESS), delay: 60_000 }]);
    const user = userEvent.setup();

    await user.selectOptions(productSelect(), 'p1');
    await user.click(submitButton());

    expect(await screen.findByRole('button', { name: COMPLETE_COPY.busy })).toBeDisabled();
    expect(screen.getByRole('button', { name: COMPLETE_COPY.keep })).toBeDisabled();
  });

  it('explains an empty category rather than offering an empty select', () => {
    renderModal([], { options: [] });

    expect(screen.getByText(COMPLETE_COPY.noProducts('Unhas'))).toBeInTheDocument();
    expect(screen.queryByLabelText(COMPLETE_COPY.productsLabel)).not.toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('holds the select while the products load, without calling the list empty', () => {
    renderModal([], { options: [], isLoadingProducts: true });

    expect(productSelect()).toBeDisabled();
    expect(screen.queryByText(COMPLETE_COPY.noProducts('Unhas'))).not.toBeInTheDocument();
  });
});

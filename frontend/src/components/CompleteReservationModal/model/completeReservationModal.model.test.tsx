import { useQuery } from '@apollo/client/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCache } from '../../../graphql/cache';
import {
  PRODUCTS_PICKER_PAGE_SIZE,
  RESERVATION_PRODUCTS_QUERY,
  SCHEDULES_PAGE_SIZE,
  SCHEDULES_QUERY,
} from '../../../pages/Schedules/model/schedules.model';
import {
  COMPLETE_RESERVATION_MUTATION,
  useCompleteReservationModalModel,
} from './completeReservationModal.model';

function aNode(id: string) {
  return {
    __typename: 'Schedule' as const,
    id,
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    status: 'confirmed' as const,
    finalPrice: 35,
    tip: null,
    user: { __typename: 'User' as const, id: 'client-1', name: 'Maria Silva' },
    service: {
      __typename: 'Service' as const,
      id: 'service-1',
      name: 'Gel',
      category: 'nails' as const,
    },
  };
}

function aConnection(ids: string[]) {
  return {
    schedules: {
      __typename: 'ScheduleConnection' as const,
      edges: ids.map((id) => ({
        __typename: 'ScheduleEdge' as const,
        cursor: `cursor-${id}`,
        node: aNode(id),
      })),
      pageInfo: { __typename: 'PageInfo' as const, hasNextPage: false, endCursor: null },
    },
  };
}

const SCHEDULES_VARIABLES = {
  first: SCHEDULES_PAGE_SIZE,
  filter: { status: 'confirmed' as const },
};
const PRODUCTS_VARIABLES = { first: PRODUCTS_PICKER_PAGE_SIZE };
const NO_PRODUCTS = {
  products: {
    __typename: 'ProductConnection' as const,
    edges: [],
    pageInfo: { __typename: 'PageInfo' as const, hasNextPage: false, endCursor: null },
  },
};

const SUCCESS = {
  __typename: 'CompleteScheduleSuccess',
  schedule: { __typename: 'Schedule', id: 's2', status: 'completed', tip: 5, finalPrice: 35 },
};

describe('useCompleteReservationModalModel — through a real mutation', () => {
  const schedulesRefetch = vi.fn();
  const productsRefetch = vi.fn();
  const settled = vi.fn();

  function Harness() {
    // Stands in for the Reservas page: the active queries the refetches target.
    useQuery(SCHEDULES_QUERY, { variables: SCHEDULES_VARIABLES });
    useQuery(RESERVATION_PRODUCTS_QUERY, { variables: PRODUCTS_VARIABLES });
    const { reservation, completeSchedule } = useCompleteReservationModalModel('s2');

    return (
      <div>
        <span>{reservation?.user.name ?? ''}</span>
        <button
          type="button"
          onClick={async () => {
            await completeSchedule({
              variables: { input: { scheduleId: 's2', productIds: ['p1'], tip: 5 } },
            });
            settled();
          }}
        >
          concluir
        </button>
      </div>
    );
  }

  function renderHarness(payload: Record<string, unknown>, refetchDelay = 0) {
    const cache = createCache();
    const mocks: MockedResponse[] = [
      {
        request: { query: SCHEDULES_QUERY, variables: SCHEDULES_VARIABLES },
        result: { data: aConnection(['s1', 's2']) },
      },
      {
        request: { query: RESERVATION_PRODUCTS_QUERY, variables: PRODUCTS_VARIABLES },
        result: { data: NO_PRODUCTS },
      },
      {
        request: {
          query: COMPLETE_RESERVATION_MUTATION,
          variables: { input: { scheduleId: 's2', productIds: ['p1'], tip: 5 } },
        },
        result: { data: { completeSchedule: payload } },
      },
      {
        request: { query: SCHEDULES_QUERY, variables: SCHEDULES_VARIABLES },
        delay: refetchDelay,
        result: () => {
          schedulesRefetch();
          return { data: aConnection(['s1']) };
        },
      },
      {
        request: { query: RESERVATION_PRODUCTS_QUERY, variables: PRODUCTS_VARIABLES },
        result: () => {
          productsRefetch();
          return { data: NO_PRODUCTS };
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} cache={cache}>
        <Harness />
      </MockedProvider>,
    );

    return cache;
  }

  const readIds = (cache: ReturnType<typeof createCache>) =>
    cache
      .readQuery({ query: SCHEDULES_QUERY, variables: SCHEDULES_VARIABLES })
      ?.schedules.edges.map((edge) => edge.node.id);

  const press = async () => {
    await screen.findByText('Maria Silva');
    await userEvent.setup().click(screen.getByRole('button', { name: 'concluir' }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('on success, updates the entity, drops the row and refetches the list', async () => {
    const cache = renderHarness(SUCCESS);

    await press();

    await vi.waitFor(() => expect(schedulesRefetch).toHaveBeenCalledTimes(1));
    expect(readIds(cache)).toEqual(['s1']);
    expect(cache.extract()['Schedule:s2']).toMatchObject({
      status: 'completed',
      tip: 5,
      finalPrice: 35,
    });
  });

  it('drops the row at once, without waiting for the refetch to answer', async () => {
    const cache = renderHarness(SUCCESS, 60_000);

    await press();

    await vi.waitFor(() => expect(readIds(cache)).toEqual(['s1']));
    expect(schedulesRefetch).not.toHaveBeenCalled();
  });

  it('does not refetch the products on success', async () => {
    renderHarness(SUCCESS);

    await press();

    await vi.waitFor(() => expect(schedulesRefetch).toHaveBeenCalledTimes(1));
    expect(productsRefetch).not.toHaveBeenCalled();
  });

  it('leaves the row to the refetch when another device already moved it', async () => {
    const cache = renderHarness(
      { __typename: 'ScheduleNotCompletableError', message: 'Schedule already completed' },
      60_000,
    );

    await press();

    await vi.waitFor(() => expect(settled).toHaveBeenCalledTimes(1));
    expect(readIds(cache)).toEqual(['s1', 's2']);
    expect(cache.extract()['Schedule:s2']).toMatchObject({ status: 'confirmed' });
  });

  it('still refetches the list when another device already moved it', async () => {
    renderHarness({ __typename: 'ScheduleNotCompletableError', message: 'Already completed' });

    await press();

    await vi.waitFor(() => expect(schedulesRefetch).toHaveBeenCalledTimes(1));
  });

  it('refetches the products too when one of them no longer exists', async () => {
    renderHarness({ __typename: 'ProductNotFoundError', message: 'Product not found' });

    await press();

    await vi.waitFor(() => expect(productsRefetch).toHaveBeenCalledTimes(1));
    expect(schedulesRefetch).toHaveBeenCalledTimes(1);
  });
});

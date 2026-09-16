import { useQuery } from '@apollo/client/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCache } from '../../../graphql/cache';
import {
  SCHEDULES_PAGE_SIZE,
  SCHEDULES_QUERY,
} from '../../../pages/Schedules/model/schedules.model';
import {
  removeFromScheduleConnections,
  SCHEDULES_OPERATION,
  UPDATE_RESERVATION_STATUS_MUTATION,
  useReservationStatusModalModel,
} from './reservationStatusModal.model';

function aNode(id: string, status: 'pending' | 'confirmed' = 'pending') {
  return {
    __typename: 'Schedule' as const,
    id,
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    status,
    finalPrice: 35,
    user: { __typename: 'User' as const, id: 'client-1', name: 'Maria Silva' },
    service: {
      __typename: 'Service' as const,
      id: 'service-1',
      name: 'Gel',
      category: 'nails' as const,
    },
  };
}

function aConnection(nodes: ReturnType<typeof aNode>[]) {
  return {
    schedules: {
      __typename: 'ScheduleConnection' as const,
      edges: nodes.map((node) => ({
        __typename: 'ScheduleEdge' as const,
        cursor: `cursor-${node.id}`,
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo' as const,
        hasNextPage: true,
        endCursor: `cursor-${nodes[nodes.length - 1]?.id ?? ''}`,
      },
    },
  };
}

const variablesFor = (status: 'pending' | 'confirmed') => ({
  first: SCHEDULES_PAGE_SIZE,
  filter: { status },
});

type TestCache = ReturnType<typeof createCache>;

function readIds(cache: TestCache, status: 'pending' | 'confirmed') {
  const data = cache.readQuery({ query: SCHEDULES_QUERY, variables: variablesFor(status) });
  return data?.schedules.edges.map((edge) => edge.node.id) ?? null;
}

describe('removeFromScheduleConnections — against a real cache', () => {
  function seededCache() {
    const cache = createCache();
    cache.writeQuery({
      query: SCHEDULES_QUERY,
      variables: variablesFor('pending'),
      data: aConnection([aNode('s1'), aNode('s2'), aNode('s3')]),
    });
    cache.writeQuery({
      query: SCHEDULES_QUERY,
      variables: variablesFor('confirmed'),
      data: aConnection([aNode('s9', 'confirmed')]),
    });
    return cache;
  }

  it('drops the edge from the bucket it sat in and leaves the page info alone', () => {
    const cache = seededCache();

    removeFromScheduleConnections(cache, 's2');

    expect(readIds(cache, 'pending')).toEqual(['s1', 's3']);
    const pending = cache.readQuery({ query: SCHEDULES_QUERY, variables: variablesFor('pending') });
    expect(pending?.schedules.pageInfo).toEqual({
      __typename: 'PageInfo',
      hasNextPage: true,
      endCursor: 'cursor-s3',
    });
  });

  it('leaves every other bucket untouched', () => {
    const cache = seededCache();

    removeFromScheduleConnections(cache, 's2');

    expect(readIds(cache, 'confirmed')).toEqual(['s9']);
  });

  it('changes nothing for an id that is in no bucket', () => {
    const cache = seededCache();

    removeFromScheduleConnections(cache, 'nowhere');

    expect(readIds(cache, 'pending')).toEqual(['s1', 's2', 's3']);
    expect(readIds(cache, 'confirmed')).toEqual(['s9']);
  });

  it('keeps the reservation itself — the Agenda still reads it', () => {
    const cache = seededCache();

    removeFromScheduleConnections(cache, 's2');

    expect(cache.extract()['Schedule:s2']).toBeDefined();
  });

  it('does not throw when no schedules connection has been stored yet', () => {
    const cache = createCache();

    expect(() => removeFromScheduleConnections(cache, 's2')).not.toThrow();
  });
});

describe('useReservationStatusModalModel — through a real mutation', () => {
  const refetchSpy = vi.fn();
  const settledSpy = vi.fn();

  function Harness({ scheduleId }: { scheduleId: string | null }) {
    // Stands in for the Reservas page: the active `Schedules` query the refetch targets.
    useQuery(SCHEDULES_QUERY, { variables: variablesFor('pending') });
    const { reservation, updateStatus } = useReservationStatusModalModel(scheduleId);

    return (
      <div>
        <span data-testid="subject">{reservation?.user.name ?? ''}</span>
        <button
          type="button"
          onClick={async () => {
            await updateStatus({ variables: { input: { id: 's2', status: 'confirmed' } } });
            settledSpy();
          }}
        >
          confirmar
        </button>
      </div>
    );
  }

  function aMutationMock(result: Record<string, unknown>): MockedResponse {
    return {
      request: {
        query: UPDATE_RESERVATION_STATUS_MUTATION,
        variables: { input: { id: 's2', status: 'confirmed' } },
      },
      result: { data: { updateSchedule: result } },
    };
  }

  function renderHarness(
    mutation: MockedResponse,
    scheduleId: string | null = 's2',
    refetchDelay = 0,
  ) {
    const cache = createCache();
    const mocks: MockedResponse[] = [
      {
        request: { query: SCHEDULES_QUERY, variables: variablesFor('pending') },
        result: { data: aConnection([aNode('s1'), aNode('s2'), aNode('s3')]) },
      },
      mutation,
      {
        request: { query: SCHEDULES_QUERY, variables: variablesFor('pending') },
        delay: refetchDelay,
        result: () => {
          refetchSpy();
          return { data: aConnection([aNode('s1'), aNode('s3')]) };
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} cache={cache}>
        <Harness scheduleId={scheduleId} />
      </MockedProvider>,
    );

    return cache;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('targets the Reservas query by its operation name', () => {
    expect(SCHEDULES_OPERATION).toBe('Schedules');
  });

  it('reads the reservation once the page’s query has filled the cache', async () => {
    renderHarness(aMutationMock({ __typename: 'UpdateScheduleSuccess' }));

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
  });

  it('reads nothing while no reservation is chosen', async () => {
    const cache = renderHarness(aMutationMock({ __typename: 'UpdateScheduleSuccess' }), null);

    await vi.waitFor(() => expect(readIds(cache, 'pending')).toEqual(['s1', 's2', 's3']));
    expect(screen.getByTestId('subject')).toBeEmptyDOMElement();
  });

  it('on success, moves the status onto the entity, drops the row and refetches the list', async () => {
    const cache = renderHarness(
      aMutationMock({
        __typename: 'UpdateScheduleSuccess',
        schedule: { __typename: 'Schedule', id: 's2', status: 'confirmed' },
      }),
    );
    await screen.findByText('Maria Silva');

    await userEvent.setup().click(screen.getByRole('button', { name: 'confirmar' }));

    await vi.waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(readIds(cache, 'pending')).toEqual(['s1', 's3']));
    expect(cache.extract()['Schedule:s2']).toMatchObject({ status: 'confirmed' });
  });

  it('on a refused transition, leaves the row to the refetch rather than removing it itself', async () => {
    const cache = renderHarness(
      aMutationMock({
        __typename: 'ScheduleAlreadyBookedError',
        message: 'Invalid schedule status transition: cancelled -> confirmed',
      }),
    );
    await screen.findByText('Maria Silva');

    await userEvent.setup().click(screen.getByRole('button', { name: 'confirmar' }));

    // The refetch still runs — it is what clears a row another device already moved.
    await vi.waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(1));
    expect(cache.extract()['Schedule:s2']).toMatchObject({ status: 'pending' });
  });

  it('drops the row at once, without waiting for the refetch to answer', async () => {
    const cache = renderHarness(
      aMutationMock({
        __typename: 'UpdateScheduleSuccess',
        schedule: { __typename: 'Schedule', id: 's2', status: 'confirmed' },
      }),
      's2',
      60_000,
    );
    await screen.findByText('Maria Silva');

    await userEvent.setup().click(screen.getByRole('button', { name: 'confirmar' }));

    await vi.waitFor(() => expect(readIds(cache, 'pending')).toEqual(['s1', 's3']));
    expect(refetchSpy).not.toHaveBeenCalled();
  });

  it('does not drop the row itself when the transition was refused', async () => {
    const cache = renderHarness(
      aMutationMock({
        __typename: 'ScheduleAlreadyBookedError',
        message: 'Invalid schedule status transition: cancelled -> confirmed',
      }),
      's2',
      60_000,
    );
    await screen.findByText('Maria Silva');

    await userEvent.setup().click(screen.getByRole('button', { name: 'confirmar' }));

    await vi.waitFor(() => expect(settledSpy).toHaveBeenCalledTimes(1));
    expect(readIds(cache, 'pending')).toEqual(['s1', 's2', 's3']);
    expect(refetchSpy).not.toHaveBeenCalled();
  });
});

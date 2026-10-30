import { createCache } from './cache';
import { removeFromScheduleConnections } from './scheduleConnections';
import { SCHEDULES_PAGE_SIZE, SCHEDULES_QUERY } from '../pages/Schedules/model/schedules.model';

function aNode(id: string, status: 'pending' | 'confirmed' = 'pending') {
  return {
    __typename: 'Schedule' as const,
    id,
    date: new Date(2026, 8, 12, 10, 0).toISOString(),
    status,
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

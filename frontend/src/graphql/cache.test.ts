import { gql } from '@apollo/client';
import { createCache } from './cache';

const USERS = gql`
  query Users($first: Int, $after: String, $role: RoleName) {
    users(first: $first, after: $after, role: $role) {
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const aPage = (ids: readonly string[]) => ({
  users: {
    __typename: 'UserConnection',
    edges: ids.map((id) => ({
      __typename: 'UserEdge',
      cursor: `cursor-${id}`,
      node: { __typename: 'User', id },
    })),
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: true,
      endCursor: `cursor-${ids[ids.length - 1] ?? ''}`,
    },
  },
});

const idsOf = (result: unknown) =>
  (result as { users: { edges: { node: { id: string } }[] } }).users.edges.map(
    (edge) => edge.node.id,
  );

describe('the users cache policy', () => {
  it('does not let a Clientes page overwrite the booking picker page', () => {
    const cache = createCache();
    const picker = { first: 100, role: 'client' };
    const browse = { first: 25, role: 'client' };

    cache.writeQuery({ query: USERS, variables: picker, data: aPage(['a', 'b', 'c']) });
    cache.writeQuery({ query: USERS, variables: browse, data: aPage(['a']) });

    expect(idsOf(cache.readQuery({ query: USERS, variables: picker }))).toEqual(['a', 'b', 'c']);
    expect(idsOf(cache.readQuery({ query: USERS, variables: browse }))).toEqual(['a']);
  });

  it('still merges the pages of one list with each other', () => {
    const cache = createCache();
    const browse = { first: 25, role: 'client' };

    cache.writeQuery({ query: USERS, variables: browse, data: aPage(['a']) });
    cache.writeQuery({
      query: USERS,
      variables: { ...browse, after: 'cursor-a' },
      data: aPage(['b']),
    });

    expect(idsOf(cache.readQuery({ query: USERS, variables: browse }))).toEqual(['a', 'b']);
  });
});

const SCHEDULES = gql`
  query SchedulesCachePolicy($first: Int, $after: String, $filter: SchedulesFilter) {
    schedules(first: $first, after: $after, filter: $filter) {
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const aSchedulesPage = (ids: readonly string[]) => ({
  schedules: {
    __typename: 'ScheduleConnection',
    edges: ids.map((id) => ({
      __typename: 'ScheduleEdge',
      cursor: `cursor-${id}`,
      node: { __typename: 'Schedule', id },
    })),
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: true,
      endCursor: `cursor-${ids[ids.length - 1] ?? ''}`,
    },
  },
});

const scheduleIdsOf = (result: unknown) =>
  (result as { schedules: { edges: { node: { id: string } }[] } }).schedules.edges.map(
    (edge) => edge.node.id,
  );

describe('the schedules cache policy', () => {
  it('keeps each status tab in a list of its own', () => {
    const cache = createCache();
    const pending = { first: 25, filter: { status: 'pending' } };
    const cancelled = { first: 25, filter: { status: 'cancelled' } };

    cache.writeQuery({ query: SCHEDULES, variables: pending, data: aSchedulesPage(['p1', 'p2']) });
    cache.writeQuery({ query: SCHEDULES, variables: cancelled, data: aSchedulesPage(['c1']) });

    expect(scheduleIdsOf(cache.readQuery({ query: SCHEDULES, variables: pending }))).toEqual([
      'p1',
      'p2',
    ]);
    expect(scheduleIdsOf(cache.readQuery({ query: SCHEDULES, variables: cancelled }))).toEqual([
      'c1',
    ]);
  });

  it('merges the pages of one tab rather than storing each cursor apart', () => {
    const cache = createCache();
    const pending = { first: 25, filter: { status: 'pending' } };

    cache.writeQuery({ query: SCHEDULES, variables: pending, data: aSchedulesPage(['p1']) });
    cache.writeQuery({
      query: SCHEDULES,
      variables: { ...pending, after: 'cursor-p1' },
      data: aSchedulesPage(['p2']),
    });

    expect(scheduleIdsOf(cache.readQuery({ query: SCHEDULES, variables: pending }))).toEqual([
      'p1',
      'p2',
    ]);
  });
});

import type { ApolloCache, Reference } from '@apollo/client';

export const SCHEDULES_OPERATION = 'Schedules';

interface StoredEdge {
  node: Reference;
}

export function removeFromScheduleConnections(cache: ApolloCache, scheduleId: string): void {
  cache.modify({
    fields: {
      schedules(existing: unknown, { readField }) {
        if (typeof existing !== 'object' || existing === null || !('edges' in existing)) {
          return existing;
        }

        const { edges } = existing;
        if (!Array.isArray(edges)) {
          return existing;
        }

        return {
          ...existing,
          edges: edges.filter((edge: StoredEdge) => readField('id', edge.node) !== scheduleId),
        };
      },
    },
  });
}

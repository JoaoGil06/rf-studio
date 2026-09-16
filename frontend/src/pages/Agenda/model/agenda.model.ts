import { useQuery } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';
import type { MonthRef } from '../../../lib/date/calendar';

export const PICKER_PAGE_SIZE = 100;

export const AGENDA_QUERY = graphql(`
  query Agenda($filter: SchedulesRangeFilter!, $pickerSize: Int!) {
    schedulesInRange(filter: $filter) {
      id
      date
      status
      finalPrice
      service {
        id
        durationMinutes
      }
      ...ReservationEntryFields
    }
    users(role: client, first: $pickerSize) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    services(first: $pickerSize) {
      edges {
        node {
          id
          name
          category
          price
          durationMinutes
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`);

export function useAgendaModel({ year, month }: MonthRef) {
  const { data, loading, error } = useQuery(AGENDA_QUERY, {
    variables: { filter: { year, month }, pickerSize: PICKER_PAGE_SIZE },
  });

  return {
    schedules: data?.schedulesInRange ?? [],
    clients: data?.users.edges ?? [],
    hasMoreClients: data?.users.pageInfo.hasNextPage ?? false,
    services: data?.services.edges ?? [],
    loading,
    error,
  };
}

import { useQuery } from '@apollo/client/react';
import { graphql } from '../../../graphql/generated';
import type { MonthRef } from '../../../lib/date/calendar';

export const AGENDA_QUERY = graphql(`
  query Agenda($filter: SchedulesRangeFilter!) {
    schedulesInRange(filter: $filter) {
      id
      date
      status
      finalPrice
      ...ReservationEntryFields
    }
  }
`);

export function useAgendaModel({ year, month }: MonthRef) {
  const { data, loading, error } = useQuery(AGENDA_QUERY, {
    variables: { filter: { year, month } },
  });

  return { schedules: data?.schedulesInRange ?? [], loading, error };
}

import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { graphql } from '../../../graphql/generated';
import { addMonths, type MonthRef } from '../../../lib/date/calendar';

/**
 * One aliased field per month because `schedulesInRange` covers a month or a year,
 * and six months can straddle New Year. Only the selected month asks for who and
 * what: the other five only feed a bar.
 */
export const DASHBOARD_QUERY = graphql(`
  query Dashboard(
    $selected: SchedulesRangeFilter!
    $prev1: SchedulesRangeFilter!
    $prev2: SchedulesRangeFilter!
    $prev3: SchedulesRangeFilter!
    $prev4: SchedulesRangeFilter!
    $prev5: SchedulesRangeFilter!
    $pending: SchedulesRangeFilter!
  ) {
    selected: schedulesInRange(filter: $selected) {
      id
      finalPrice
      tip
      user {
        id
        name
      }
      service {
        id
        category
      }
      products {
        id
        name
        brand
        category
        color
      }
    }
    prev1: schedulesInRange(filter: $prev1) {
      id
      finalPrice
      tip
    }
    prev2: schedulesInRange(filter: $prev2) {
      id
      finalPrice
      tip
    }
    prev3: schedulesInRange(filter: $prev3) {
      id
      finalPrice
      tip
    }
    prev4: schedulesInRange(filter: $prev4) {
      id
      finalPrice
      tip
    }
    prev5: schedulesInRange(filter: $prev5) {
      id
      finalPrice
      tip
    }
    pending: schedulesInRange(filter: $pending) {
      id
    }
  }
`);

const NO_ROWS: never[] = [];
const NO_PREVIOUS_MONTHS: never[][] = [NO_ROWS, NO_ROWS, NO_ROWS, NO_ROWS, NO_ROWS];

const completedIn = ({ year, month }: MonthRef) => ({ year, month, status: 'completed' as const });

export function useDashboardModel(selected: MonthRef) {
  const variables = useMemo(
    () => ({
      selected: completedIn(selected),
      prev1: completedIn(addMonths(selected, -1)),
      prev2: completedIn(addMonths(selected, -2)),
      prev3: completedIn(addMonths(selected, -3)),
      prev4: completedIn(addMonths(selected, -4)),
      prev5: completedIn(addMonths(selected, -5)),
      pending: { year: selected.year, month: selected.month, status: 'pending' as const },
    }),
    [selected],
  );

  // A reservation completed elsewhere updates its own record, but it cannot add
  // itself to a cached `status: completed` list, so the lists must be re-read.
  const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const previous = useMemo(
    () =>
      data ? [data.prev5, data.prev4, data.prev3, data.prev2, data.prev1] : NO_PREVIOUS_MONTHS,
    [data],
  );

  // `loading` is also true while cache-and-network refreshes figures already on screen.
  const isLoading = useMemo(() => !data && loading, [data, loading]);

  return {
    selected: data?.selected ?? NO_ROWS,
    previous,
    pendingCount: data?.pending.length ?? 0,
    isLoading,
    error,
  };
}

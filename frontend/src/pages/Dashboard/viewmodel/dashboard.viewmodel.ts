import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addMonths,
  monthRefOf,
  parseMonthKey,
  toMonthKey,
  type MonthRef,
} from '../../../lib/date/calendar';
import { formatMonthLabel, formatMonthName } from '../../../lib/format/date';
import { sumRevenue } from '../../../lib/revenue';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import { MONTH_PARAM } from '../../../utils/constants/monthParam';
import { useDashboardModel } from '../model/dashboard.model';
import { toCategorySplit } from './helpers/categorySplit';
import { toDashboardKpis } from './helpers/kpis';
import { toTopClients, toTopPolishes } from './helpers/rankings';
import { toRevenueBars } from './helpers/revenueBars';

export function useDashboardViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const month = useMemo(
    () => parseMonthKey(searchParams.get(MONTH_PARAM)) ?? monthRefOf(new Date()),
    [searchParams],
  );

  const { selected, previous, pendingCount, isLoading, error } = useDashboardModel(month);

  const monthDate = useMemo(() => new Date(month.year, month.month - 1, 1), [month]);
  const monthLabel = useMemo(() => formatMonthLabel(monthDate), [monthDate]);
  const monthName = useMemo(() => formatMonthName(monthDate), [monthDate]);

  const kpis = useMemo(
    () => toDashboardKpis({ completed: selected, pendingCount, monthName }),
    [selected, pendingCount, monthName],
  );

  const bars = useMemo(() => {
    const months = [...previous, selected];

    return toRevenueBars(
      months.map((rows, index) => ({
        month: addMonths(month, index - (months.length - 1)),
        revenue: sumRevenue(rows),
        isSelected: index === months.length - 1,
      })),
    );
  }, [previous, selected, month]);

  const split = useMemo(() => toCategorySplit(selected), [selected]);
  const topClients = useMemo(() => toTopClients(selected), [selected]);
  const topPolishes = useMemo(() => toTopPolishes(selected), [selected]);

  const goToMonth = useCallback(
    (next: MonthRef) => {
      setSearchParams({ [MONTH_PARAM]: toMonthKey(next) }, { replace: true });
    },
    [setSearchParams],
  );

  const goToPreviousMonth = useCallback(() => goToMonth(addMonths(month, -1)), [goToMonth, month]);
  const goToNextMonth = useCallback(() => goToMonth(addMonths(month, 1)), [goToMonth, month]);

  const loadError = useMemo(() => (error ? DASHBOARD_COPY.load : null), [error]);

  return {
    monthLabel,
    goToPreviousMonth,
    goToNextMonth,
    kpis,
    bars,
    split,
    topClients,
    topPolishes,
    isLoading,
    loadError,
  };
}

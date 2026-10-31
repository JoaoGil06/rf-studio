import type { RevenueBar } from '../../../../components/RevenueBars/types/revenueBars.types';
import { toMonthKey } from '../../../../lib/date/calendar';
import { MONTH_HEADS, formatMonthLabel } from '../../../../lib/format/date';
import { formatEuros, formatWholeEuros } from '../../../../lib/format/money';
import { DASHBOARD_COPY } from '../../../../utils/constants/dashboardMessages';
import type { MonthRevenue } from '../../types/dashboard.types';

/** Small earnings stay visible, but a month that earned nothing draws no bar at all. */
const MIN_VISIBLE_PERCENT = 3;

export function toRevenueBars(months: readonly MonthRevenue[]): RevenueBar[] {
  const highest = Math.max(0, ...months.map(({ revenue }) => revenue));

  return months.map(({ month, revenue, isSelected }) => {
    const monthLabel = formatMonthLabel(new Date(month.year, month.month - 1, 1));
    const exactAmount = formatEuros(revenue) ?? DASHBOARD_COPY.unknownAmount;

    return {
      key: toMonthKey(month),
      label: MONTH_HEADS[month.month - 1] ?? '',
      value: formatWholeEuros(revenue) ?? DASHBOARD_COPY.unknownAmount,
      spokenLabel: `${monthLabel}: ${exactAmount}`,
      heightPercent:
        revenue > 0 ? Math.max(MIN_VISIBLE_PERCENT, Math.round((revenue / highest) * 100)) : 0,
      isSelected,
    };
  });
}

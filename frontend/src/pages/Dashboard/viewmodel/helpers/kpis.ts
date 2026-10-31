import { formatEuros } from '../../../../lib/format/money';
import { sumRevenue, type RevenueRow } from '../../../../lib/revenue';
import { DASHBOARD_COPY } from '../../../../utils/constants/dashboardMessages';
import type { KpiFigure } from '../../types/dashboard.types';

interface KpiInput {
  completed: readonly RevenueRow[];
  pendingCount: number;
  monthName: string;
}

export function toDashboardKpis({ completed, pendingCount, monthName }: KpiInput): KpiFigure[] {
  const revenue = sumRevenue(completed);

  // An empty month has no average: zero would claim she charged nothing.
  const average =
    completed.length > 0 ? formatEuros(revenue / completed.length) : DASHBOARD_COPY.unknownAmount;

  return [
    {
      key: 'revenue',
      value: formatEuros(revenue) ?? DASHBOARD_COPY.unknownAmount,
      label: `${DASHBOARD_COPY.kpiRevenue} · ${monthName.toUpperCase()}`,
    },
    {
      key: 'completed',
      value: String(completed.length),
      label: DASHBOARD_COPY.kpiCompleted,
    },
    {
      key: 'pending',
      value: String(pendingCount),
      label: DASHBOARD_COPY.kpiPending,
    },
    {
      key: 'average',
      value: average ?? DASHBOARD_COPY.unknownAmount,
      label: DASHBOARD_COPY.kpiAverage,
    },
  ];
}

import type { CategorySplitFigures } from '../../../../components/CategorySplit/types/categorySplit.types';
import { sumRevenue } from '../../../../lib/revenue';
import { DASHBOARD_COPY } from '../../../../utils/constants/dashboardMessages';
import type { CompletedRecord } from '../../types/dashboard.types';

export function toCategorySplit(rows: readonly CompletedRecord[]): CategorySplitFigures | null {
  const nails = sumRevenue(rows.filter((row) => row.service.category === 'nails'));
  const brows = sumRevenue(rows.filter((row) => row.service.category === 'eyebrows'));
  const total = nails + brows;

  if (total <= 0) {
    return null;
  }

  const nailsPercent = Math.round((nails / total) * 100);
  // Derived from the other side so the two always add up to 100.
  const browsPercent = 100 - nailsPercent;

  return {
    nailsPercent,
    browsPercent,
    nailsLabel: `${DASHBOARD_COPY.splitNails} ${nailsPercent}%`,
    browsLabel: `${DASHBOARD_COPY.splitBrows} ${browsPercent}%`,
  };
}

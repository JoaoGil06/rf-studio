export interface RevenueRow {
  finalPrice: number;
  tip?: number | null;
}

/** What a completed reservation earned. A tip counts as revenue. */
export const revenueOf = ({ finalPrice, tip }: RevenueRow) => finalPrice + (tip ?? 0);

export const sumRevenue = (rows: readonly RevenueRow[]) =>
  rows.reduce((total, row) => total + revenueOf(row), 0);

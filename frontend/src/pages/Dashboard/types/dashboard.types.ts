import type { MonthRef } from '../../../lib/date/calendar';
import type { RevenueRow } from '../../../lib/revenue';

export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  category: string;
  color?: string | null;
}

export interface CompletedRecord extends RevenueRow {
  id: string;
  user: { id: string; name: string };
  service: { id: string; category: string };
  products: readonly ProductRecord[];
}

export interface MonthRevenue {
  month: MonthRef;
  revenue: number;
  isSelected: boolean;
}

export interface KpiFigure {
  key: string;
  value: string;
  label: string;
}

export interface RevenueBar {
  key: string;
  label: string;
  value: string;
  /** The exact amount and the full month, because `value` drops the cents. */
  spokenLabel: string;
  heightPercent: number;
  isSelected: boolean;
}

export interface RevenueBarsProps {
  bars: readonly RevenueBar[];
}

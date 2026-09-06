export interface MonthGridDay {
  key: string;
  dayOfMonth: number;
  isOutsideMonth: boolean;
  isClosed: boolean;
  isToday: boolean;
  isSelected: boolean;
  count: number | null;
  reservationIds: readonly string[];
  overflow: number;
  description: string;
}

export interface CalendarMonthGridProps {
  days: readonly MonthGridDay[];
  isDaySelectable: boolean;
  onSelectDay: (key: string) => void;
}

export interface MonthDayCellProps {
  day: MonthGridDay;
  isSelectable: boolean;
  onSelect: (key: string) => void;
}

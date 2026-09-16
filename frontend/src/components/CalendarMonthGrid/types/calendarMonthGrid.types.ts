export type CellAction = 'select' | 'add';

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
  canAdd: boolean;
  addLabel: string;
}

export interface CalendarMonthGridProps {
  days: readonly MonthGridDay[];
  cellAction: CellAction;
  onSelectDay: (key: string) => void;
  onAddDay: (key: string) => void;
}

export interface MonthDayCellProps {
  day: MonthGridDay;
  cellAction: CellAction;
  onSelect: (key: string) => void;
  onAdd: (key: string) => void;
}

export interface WeekStripDay {
  key: string;
  dayOfMonth: number;
  isOutsideMonth: boolean;
  isClosed: boolean;
  isToday: boolean;
  isSelected: boolean;
  dots: readonly string[];
  description: string;
}

export interface WeekStripPage {
  key: string;
  days: readonly WeekStripDay[];
}

export interface CalendarWeekStripProps {
  weeks: readonly WeekStripPage[];
  selectedKey: string | null;
  onSelectDay: (key: string) => void;
}

export interface WeekStripCellProps {
  day: WeekStripDay;
  onSelect: (key: string) => void;
}

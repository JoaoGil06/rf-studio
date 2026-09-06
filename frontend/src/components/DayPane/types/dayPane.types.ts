export interface DaySlot {
  time: string;
  reservationIds: readonly string[];
}

export interface DayPaneProps {
  dayLabel: string | null;
  countLabel: string;
  isClosed: boolean;
  slots: readonly DaySlot[];
}

export interface DaySlotRowProps {
  slot: DaySlot;
}

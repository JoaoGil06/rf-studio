export interface DaySlot {
  time: string;
  reservationIds: readonly string[];
  isCovered: boolean;
}

export interface DayPaneProps {
  dayLabel: string | null;
  countLabel: string;
  isClosed: boolean;
  slots: readonly DaySlot[];
  addLabel: string | null;
  onAddReservation: () => void;
}

export interface DaySlotRowProps {
  slot: DaySlot;
}

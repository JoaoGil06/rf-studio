export interface SlotRange {
  /** Minutes from midnight, inclusive. */
  startMinutes: number;
  /** Minutes from midnight, exclusive. */
  endMinutes: number;
}

export const STUDIO_SLOT_MINUTES = 30;

/**
 * 09:00–12:00 and 14:00–17:30. The midday gap is real (PRODUCT.md) and the two
 * halves are why the day list can be set as two ruled columns when the phone is
 * sideways. `endMinutes` is exclusive, so the afternoon's last slot is 17:30.
 */
export const STUDIO_HOURS: readonly SlotRange[] = [
  { startMinutes: 9 * 60, endMinutes: 12 * 60 },
  { startMinutes: 14 * 60, endMinutes: 18 * 60 },
];

/**
 * Sunday. There is no closed-day model in the backend — this is a frontend fact
 * about the studio, and the day pane still renders the list rather than the hatch
 * when a closed day somehow carries reservations.
 */
export const CLOSED_WEEKDAYS: readonly number[] = [0];

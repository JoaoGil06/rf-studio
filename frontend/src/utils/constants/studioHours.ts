export interface SlotRange {
  /** Minutes from midnight, inclusive. */
  startMinutes: number;
  /** Minutes from midnight, exclusive. */
  endMinutes: number;
}

export const STUDIO_SLOT_MINUTES = 30;

/**
 * 09:00–22:00, one unbroken range. The lunch hours (12:00–13:30) are bookable like
 * any other — PRODUCT.md §Operating Context, *Day shape*.
 *
 * `endMinutes` is exclusive, so the range runs to 22:00 *inclusive* by ending one
 * slot past it — 22:00 is an hour Rita takes, not the moment she stops.
 */
export const STUDIO_HOURS: readonly SlotRange[] = [
  { startMinutes: 9 * 60, endMinutes: 22 * 60 + STUDIO_SLOT_MINUTES },
];

/**
 * Sunday. There is no closed-day model in the backend — this is a frontend fact
 * about the studio, and the day pane still renders the list rather than the hatch
 * when a closed day somehow carries reservations.
 */
export const CLOSED_WEEKDAYS: readonly number[] = [0];

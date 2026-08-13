const MINUTES_PER_HOUR = 60;

/**
 * `45` → `45 min`, `60` → `1 h`, `90` → `1 h 30`.
 *
 * Lowercase on purpose: the card's meta line is tracked capitals and uppercases
 * this itself. `lib/` formats; it does not style.
 */
export function formatDuration(minutes: number): string | null {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return null;
  }

  const whole = Math.round(minutes);
  const hours = Math.floor(whole / MINUTES_PER_HOUR);
  const rest = whole % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${rest} min`;
  }

  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}

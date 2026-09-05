const NINE_DIGITS = /^\d{9}$/;

/**
 * `912345678` → `912 345 678`.
 *
 * Anything that is not exactly nine bare digits — a `+351` prefix, an already
 * spaced number, a short or long one — comes back untouched. The backend only
 * validates `min(9)`, so this has to be total, and a client book that prettifies
 * a mistyped number is worse than one that shows it as entered.
 */
export function formatPhoneNumber(value: string): string {
  const trimmed = value.trim();

  if (!NINE_DIGITS.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed.slice(0, 3)} ${trimmed.slice(3, 6)} ${trimmed.slice(6)}`;
}

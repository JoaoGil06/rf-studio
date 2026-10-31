/**
 * Built once. Constructing an Intl.NumberFormat is the expensive part; a grid of
 * 25 cards would otherwise build 25 per render.
 *
 * Note the output separator: pt-PT puts a **no-break space** (U+00A0) between the
 * figure and the €. A test asserting `'15,00 €'` typed with an ordinary space will
 * not match. See money.test.ts.
 */
const EUROS = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const WHOLE_EUROS = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `15` → `15,00 €`. Non-finite input yields `null` — the caller decides what to show. */
export function formatEuros(amount: number): string | null {
  if (!Number.isFinite(amount)) {
    return null;
  }

  return EUROS.format(amount);
}

/** `1234.5` → `1235 €`, for a space too narrow to hold the cents. */
export function formatWholeEuros(amount: number): string | null {
  if (!Number.isFinite(amount)) {
    return null;
  }

  return WHOLE_EUROS.format(amount);
}

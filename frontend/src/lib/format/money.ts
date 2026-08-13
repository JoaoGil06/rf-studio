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

/** `15` → `15,00 €`. Non-finite input yields `null` — the caller decides what to show. */
export function formatEuros(amount: number): string | null {
  if (!Number.isFinite(amount)) {
    return null;
  }

  return EUROS.format(amount);
}

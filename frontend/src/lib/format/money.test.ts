import { formatEuros } from './money';

/** The pt-PT separator, spelt as an escape. A pasted U+00A0 is indistinguishable
 *  from a space on screen, which is exactly how this bug hides. */
const NBSP = '\u00A0';

/**
 * Every price assertion in the app normalises through this, so no later test has
 * to rediscover that `getByText('15,00 €')` typed with an ordinary space misses.
 */
const normalise = (value: string | null) => value?.replaceAll(NBSP, ' ') ?? null;

describe('formatEuros', () => {
  it('formats a whole amount with two decimals and the euro sign last', () => {
    expect(normalise(formatEuros(15))).toBe('15,00 \u20AC');
  });

  it('uses the pt-PT decimal comma', () => {
    expect(normalise(formatEuros(12.5))).toBe('12,50 \u20AC');
  });

  it('separates the figure from the euro sign with a no-break space, not a plain one', () => {
    expect(formatEuros(15)).toBe(`15,00${NBSP}\u20AC`);
  });

  it('groups thousands the pt-PT way', () => {
    expect(normalise(formatEuros(1234.5))).toBe('1234,50 \u20AC');
  });

  it('returns null rather than "NaN €" for a non-finite amount', () => {
    expect(formatEuros(Number.NaN)).toBeNull();
    expect(formatEuros(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

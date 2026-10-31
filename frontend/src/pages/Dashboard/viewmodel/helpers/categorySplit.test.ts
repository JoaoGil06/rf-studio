import type { CompletedRecord } from '../../types/dashboard.types';
import { toCategorySplit } from './categorySplit';

function aRow(category: string, finalPrice: number, tip: number | null = null): CompletedRecord {
  return {
    id: `${category}-${finalPrice}`,
    finalPrice,
    tip,
    user: { id: 'client-1', name: 'Ana' },
    service: { id: 'service-1', category },
    products: [],
  };
}

describe('toCategorySplit', () => {
  it('gives everything to nails when only nails earned', () => {
    expect(toCategorySplit([aRow('nails', 30)])).toMatchObject({
      nailsPercent: 100,
      browsPercent: 0,
    });
  });

  it('gives everything to brows when only brows earned', () => {
    expect(toCategorySplit([aRow('eyebrows', 30)])).toMatchObject({
      nailsPercent: 0,
      browsPercent: 100,
    });
  });

  it('rounds a mixed month and still adds up to 100', () => {
    expect(toCategorySplit([aRow('nails', 1), aRow('eyebrows', 2)])).toMatchObject({
      nailsPercent: 33,
      browsPercent: 67,
    });
  });

  it('counts tips', () => {
    expect(toCategorySplit([aRow('nails', 10, 10), aRow('eyebrows', 20)])).toMatchObject({
      nailsPercent: 50,
    });
  });

  it('labels each side with its name and share', () => {
    const split = toCategorySplit([aRow('nails', 1), aRow('eyebrows', 3)]);

    expect(split?.nailsLabel).toBe('Unhas 25%');
    expect(split?.browsLabel).toBe('Sobrancelhas 75%');
  });

  it('has nothing to divide in an empty month', () => {
    expect(toCategorySplit([])).toBeNull();
  });
});

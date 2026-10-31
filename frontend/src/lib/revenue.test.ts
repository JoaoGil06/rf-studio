import { revenueOf, sumRevenue } from './revenue';

describe('revenueOf', () => {
  it('adds the tip to the final price', () => {
    expect(revenueOf({ finalPrice: 30, tip: 5 })).toBe(35);
  });

  it('counts a null or missing tip as zero', () => {
    expect(revenueOf({ finalPrice: 30, tip: null })).toBe(30);
    expect(revenueOf({ finalPrice: 30 })).toBe(30);
  });
});

describe('sumRevenue', () => {
  it('sums every row, tips included', () => {
    expect(
      sumRevenue([
        { finalPrice: 30, tip: 5 },
        { finalPrice: 20, tip: null },
      ]),
    ).toBe(55);
  });

  it('is zero for no rows', () => {
    expect(sumRevenue([])).toBe(0);
  });
});

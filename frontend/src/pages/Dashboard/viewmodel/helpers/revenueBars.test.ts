import { addMonths } from '../../../../lib/date/calendar';
import { toRevenueBars } from './revenueBars';

const normalise = (value: string | undefined) => value?.replaceAll(' ', ' ');

function monthsEndingAt(year: number, month: number, revenues: number[]) {
  return revenues.map((revenue, index) => ({
    month: addMonths({ year, month }, index - (revenues.length - 1)),
    revenue,
    isSelected: index === revenues.length - 1,
  }));
}

describe('toRevenueBars', () => {
  it('scales the highest month to the full height', () => {
    const bars = toRevenueBars(monthsEndingAt(2026, 10, [100, 200, 50]));

    expect(bars.map((bar) => bar.heightPercent)).toEqual([50, 100, 25]);
  });

  it('draws no bar for a month that earned nothing', () => {
    const [empty] = toRevenueBars(monthsEndingAt(2026, 10, [0, 200]));

    expect(empty?.heightPercent).toBe(0);
  });

  it('keeps a very small amount visible', () => {
    const [small] = toRevenueBars(monthsEndingAt(2026, 10, [1, 1000]));

    expect(small?.heightPercent).toBe(3);
  });

  it('does not divide by zero when nothing was earned at all', () => {
    const bars = toRevenueBars(monthsEndingAt(2026, 10, [0, 0, 0, 0, 0, 0]));

    expect(bars.map((bar) => bar.heightPercent)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('labels a window across New Year in order', () => {
    const bars = toRevenueBars(monthsEndingAt(2026, 4, [1, 1, 1, 1, 1, 1]));

    expect(bars.map((bar) => bar.label)).toEqual(['NOV', 'DEZ', 'JAN', 'FEV', 'MAR', 'ABR']);
    expect(bars[0]?.key).toBe('2025-11');
  });

  it('shows whole euros, and keeps the exact amount for the spoken label', () => {
    const [bar] = toRevenueBars(monthsEndingAt(2026, 10, [1234.5]));

    expect(normalise(bar?.value)).toBe('1235 €');
    expect(normalise(bar?.spokenLabel)).toBe('Outubro 2026: 1234,50 €');
  });

  it('carries which month is selected', () => {
    const bars = toRevenueBars(monthsEndingAt(2026, 10, [1, 2, 3]));

    expect(bars.map((bar) => bar.isSelected)).toEqual([false, false, true]);
  });
});

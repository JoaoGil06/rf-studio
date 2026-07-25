import { describe, it, expect } from 'vitest';
import { LoyaltyDiscountRule } from './loyalty-discount.rule.js';
import { DiscountContext } from '../discount-rule.interface.js';

const baseContext = (overrides: Partial<DiscountContext> = {}): DiscountContext => ({
  scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
  birthDate: null,
  loyaltyCompletedCount: 0,
  loyaltyGrantedCount: 0,
  ...overrides,
});

describe('LoyaltyDiscountRule', () => {
  const rule = new LoyaltyDiscountRule();

  it('grants loyalty (30%) at 9 fresh completions and 0 already granted', () => {
    expect(
      rule.evaluate(baseContext({ loyaltyCompletedCount: 9, loyaltyGrantedCount: 0 })),
    ).toEqual({ reason: 'loyalty', percentage: 30 });
  });

  it('does not grant when 9 completions but 1 already granted (cycle not yet completed)', () => {
    expect(
      rule.evaluate(baseContext({ loyaltyCompletedCount: 9, loyaltyGrantedCount: 1 })),
    ).toBeNull();
  });

  it('does not grant below the cycle threshold (8 fresh completions)', () => {
    expect(
      rule.evaluate(baseContext({ loyaltyCompletedCount: 8, loyaltyGrantedCount: 0 })),
    ).toBeNull();
  });
});

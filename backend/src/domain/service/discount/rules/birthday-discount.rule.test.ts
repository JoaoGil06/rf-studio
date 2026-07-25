import { describe, it, expect } from 'vitest';
import { BirthdayDiscountRule } from './birthday-discount.rule.js';
import { DiscountContext } from '../discount-rule.interface.js';

const baseContext = (overrides: Partial<DiscountContext> = {}): DiscountContext => ({
  scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
  birthDate: null,
  loyaltyCompletedCount: 0,
  loyaltyGrantedCount: 0,
  ...overrides,
});

describe('BirthdayDiscountRule', () => {
  const rule = new BirthdayDiscountRule();

  it('grants birthday (10%) when the schedule month matches the birth month', () => {
    expect(
      rule.evaluate(
        baseContext({
          scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
          birthDate: new Date('1990-06-02T00:00:00.000Z'),
        }),
      ),
    ).toEqual({ reason: 'birthday', percentage: 10 });
  });

  it('does not grant when the schedule month differs from the birth month', () => {
    expect(
      rule.evaluate(
        baseContext({
          scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
          birthDate: new Date('1990-07-15T00:00:00.000Z'),
        }),
      ),
    ).toBeNull();
  });

  it('does not grant when birthDate is null', () => {
    expect(rule.evaluate(baseContext({ birthDate: null }))).toBeNull();
  });
});

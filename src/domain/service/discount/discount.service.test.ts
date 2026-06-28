import { describe, it, expect } from 'vitest';
import { DiscountService } from './discount.service.js';
import { AppliedDiscount, DiscountContext, DiscountRule } from './discount-rule.interface.js';

const baseContext = (overrides: Partial<DiscountContext> = {}): DiscountContext => ({
  scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
  birthDate: null,
  loyaltyCompletedCount: 0,
  loyaltyGrantedCount: 0,
  ...overrides,
});

describe('DiscountService', () => {
  it('returns loyalty (30) when both loyalty and birthday qualify (best-only)', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({
        loyaltyCompletedCount: 9,
        loyaltyGrantedCount: 0,
        scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
        birthDate: new Date('1990-06-02T00:00:00.000Z'),
      }),
    );

    expect(result).toEqual({ reason: 'loyalty', percentage: 30 });
  });

  it('returns birthday (10) when only birthday qualifies', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({
        scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
        birthDate: new Date('1990-06-02T00:00:00.000Z'),
      }),
    );

    expect(result).toEqual({ reason: 'birthday', percentage: 10 });
  });

  it('returns null when no rule qualifies', () => {
    const service = new DiscountService();
    expect(service.resolveBest(baseContext())).toBeNull();
  });

  it('iterates over the injected rule list', () => {
    const fakeRule: DiscountRule = {
      evaluate: (): AppliedDiscount => ({ reason: 'birthday', percentage: 50 }),
    };
    const service = new DiscountService([fakeRule]);

    expect(service.resolveBest(baseContext())).toEqual({ reason: 'birthday', percentage: 50 });
  });
});

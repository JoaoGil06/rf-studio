import { describe, it, expect } from 'vitest';
import { DiscountService } from './discount.service.js';
import {
  AppliedDiscount,
  DiscountContext,
  DiscountReason,
  DiscountRule,
} from './discount-rule.interface.js';

const baseContext = (overrides: Partial<DiscountContext> = {}): DiscountContext => ({
  scheduleDate: new Date('2026-06-15T00:00:00.000Z'),
  birthDate: null,
  loyaltyCompletedCount: 0,
  loyaltyGrantedCount: 0,
  ...overrides,
});

const ALL: ReadonlySet<DiscountReason> = new Set(['loyalty', 'birthday']);

describe('DiscountService', () => {
  it('returns loyalty (30) when both qualify and both are enabled (best-only)', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({
        loyaltyCompletedCount: 9,
        loyaltyGrantedCount: 0,
        birthDate: new Date('1990-06-02T00:00:00.000Z'),
      }),
      ALL,
    );

    expect(result).toEqual({ reason: 'loyalty', percentage: 30 });
  });

  it('returns birthday (10) when only birthday qualifies', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({ birthDate: new Date('1990-06-02T00:00:00.000Z') }),
      ALL,
    );

    expect(result).toEqual({ reason: 'birthday', percentage: 10 });
  });

  it('returns null when no rule qualifies', () => {
    const service = new DiscountService();
    expect(service.resolveBest(baseContext(), ALL)).toBeNull();
  });

  it('returns loyalty when both qualify but only loyalty is enabled', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({
        loyaltyCompletedCount: 9,
        birthDate: new Date('1990-06-02T00:00:00.000Z'),
      }),
      new Set(['loyalty']),
    );

    expect(result).toEqual({ reason: 'loyalty', percentage: 30 });
  });

  it('returns birthday when both qualify but only birthday is enabled', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({
        loyaltyCompletedCount: 9,
        birthDate: new Date('1990-06-02T00:00:00.000Z'),
      }),
      new Set(['birthday']),
    );

    expect(result).toEqual({ reason: 'birthday', percentage: 10 });
  });

  it('returns null when rules qualify but the enabled set is empty', () => {
    const service = new DiscountService();
    const result = service.resolveBest(
      baseContext({
        loyaltyCompletedCount: 9,
        birthDate: new Date('1990-06-02T00:00:00.000Z'),
      }),
      new Set(),
    );

    expect(result).toBeNull();
  });

  it('iterates over the injected rule list, filtered by enabled reason', () => {
    const fakeRule: DiscountRule = {
      reason: 'birthday',
      evaluate: (): AppliedDiscount => ({ reason: 'birthday', percentage: 50 }),
    };
    const service = new DiscountService([fakeRule]);

    expect(service.resolveBest(baseContext(), new Set(['birthday']))).toEqual({
      reason: 'birthday',
      percentage: 50,
    });
  });
});

import {
  AppliedDiscount,
  DiscountContext,
  DiscountReason,
  DiscountRule,
} from './discount-rule.interface.js';
import { BirthdayDiscountRule } from './rules/birthday-discount.rule.js';
import { LoyaltyDiscountRule } from './rules/loyalty-discount.rule.js';

export class DiscountService {
  private readonly rules: DiscountRule[];

  constructor(rules: DiscountRule[] = [new LoyaltyDiscountRule(), new BirthdayDiscountRule()]) {
    this.rules = rules;
  }

  public resolveBest(
    context: DiscountContext,
    enabled: ReadonlySet<DiscountReason>,
  ): AppliedDiscount | null {
    const candidates = this.rules
      .filter((rule) => enabled.has(rule.reason))
      .map((rule) => rule.evaluate(context))
      .filter((discount): discount is AppliedDiscount => discount !== null);

    if (candidates.length === 0) return null;

    // Retorna sempre o melhor desconto
    return candidates.reduce((bestValue, currentValue) =>
      currentValue.percentage > bestValue.percentage ? currentValue : bestValue,
    );
  }
}

import { AppliedDiscount, DiscountContext, DiscountRule } from '../discount-rule.interface.js';

const LOYALTY_COMPLETED_PER_CYCLE = 9;
const LOYALTY_PERCENTAGE = 30;

export class LoyaltyDiscountRule implements DiscountRule {
  public evaluate(context: DiscountContext): AppliedDiscount | null {
    if (
      Math.floor(context.loyaltyCompletedCount / LOYALTY_COMPLETED_PER_CYCLE) >
      context.loyaltyGrantedCount
    ) {
      return {
        reason: 'loyalty',
        percentage: LOYALTY_PERCENTAGE,
      };
    }

    return null;
  }
}

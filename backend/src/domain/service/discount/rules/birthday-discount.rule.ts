import { AppliedDiscount, DiscountContext, DiscountRule } from '../discount-rule.interface.js';

const BIRTHDAY_PERCENTAGE = 10;

export class BirthdayDiscountRule implements DiscountRule {
  public readonly reason = 'birthday' as const;

  public evaluate(ctx: DiscountContext): AppliedDiscount | null {
    if (ctx.birthDate !== null && ctx.scheduleDate.getUTCMonth() === ctx.birthDate.getUTCMonth()) {
      return { reason: 'birthday', percentage: BIRTHDAY_PERCENTAGE };
    }
    return null;
  }
}

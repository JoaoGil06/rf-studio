import { DiscountReason } from '../service/discount/discount-rule.interface.js';

export interface SaveScheduleDiscountInput {
  scheduleId: string;
  userId: string;
  reason: DiscountReason;
  percentage: number;
}

export interface IScheduleDiscountRepository {
  save(input: SaveScheduleDiscountInput): Promise<void>;
  countByUserAndReason(userId: string, reason: DiscountReason): Promise<number>;
}

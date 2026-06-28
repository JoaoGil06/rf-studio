export type DiscountReason = 'loyalty' | 'birthday';

export interface DiscountContext {
  scheduleDate: Date;
  birthDate: Date | null;
  loyaltyCompletedCount: number; // Só as novas schedules, as que ainda não estão no ciclo de desconto
  loyaltyGrantedCount: number; // Número de descontos que já foram dados ao cliente
}

export interface AppliedDiscount {
  reason: DiscountReason;
  percentage: number;
}

export interface DiscountRule {
  evaluate(context: DiscountContext): AppliedDiscount | null;
}

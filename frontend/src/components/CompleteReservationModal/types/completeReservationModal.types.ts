import { z } from 'zod';
import type { ProductOption } from '../../ProductPicker/types/productPicker.types';

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

export const completeReservationSchema = z.object({
  productIds: z.array(z.string()).min(1, 'Associe pelo menos 1 produto para concluir.'),
  tip: z
    .number({ error: 'Introduza um valor válido.' })
    .nonnegative('A gorjeta não pode ser negativa.')
    .max(9999.99, 'Máximo 9999,99 €.')
    .refine(hasAtMostTwoDecimals, 'Use no máximo dois decimais.')
    .nullable(),
});

export type CompleteReservationFormValues = z.infer<typeof completeReservationSchema>;

export const completeReservationDefaults: CompleteReservationFormValues = {
  productIds: [],
  tip: null,
};

/** For the tip's `setValueAs`: an empty field means no tip, not `NaN`. */
export function parseTip(raw: unknown): number | null {
  return raw === '' || raw === null || raw === undefined ? null : Number(raw);
}

export interface CompleteReservationModalProps {
  scheduleId: string;
  productOptions: readonly ProductOption[];
  hasMoreProducts: boolean;
  isLoadingProducts: boolean;
  onClose: () => void;
}

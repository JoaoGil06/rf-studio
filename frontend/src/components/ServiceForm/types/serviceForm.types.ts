import type { FormEventHandler } from 'react';
import type { DefaultValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().trim().min(1, 'Introduza o nome.').max(100, 'Máximo 100 caracteres.'),
  price: z
    .number({ error: 'Introduza o preço.' })
    .nonnegative('O preço não pode ser negativo.')
    .max(9999.99, 'Máximo 9999,99 €.'),
  durationMinutes: z
    .number({ error: 'Introduza a duração.' })
    .int('Use minutos inteiros.')
    .positive('A duração tem de ser maior que zero.')
    .max(600, 'Máximo 600 minutos.'),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

const EMPTY_NUMBER = null as unknown as number;

export const serviceFormDefaults: DefaultValues<ServiceFormValues> = {
  name: '',
  price: EMPTY_NUMBER,
  durationMinutes: EMPTY_NUMBER,
};

export interface ServiceFormProps {
  register: UseFormRegister<ServiceFormValues>;
  errors: FieldErrors<ServiceFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  busyLabel: string;
}

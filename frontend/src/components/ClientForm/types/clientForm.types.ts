import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

/**
 * The `max` values are the DB column widths (`name` 100, `email` 150,
 * `phone_number` 20) — catching them here turns a 500-shaped failure into a
 * field error. `min(9)` matches the backend validator exactly; a stricter
 * Portuguese-mobile regex would reject the foreign numbers it accepts.
 */
export const clientSchema = z.object({
  name: z.string().trim().min(1, 'Introduza o nome.').max(100, 'Máximo 100 caracteres.'),
  email: z.email('Introduza um email válido.').max(150, 'Máximo 150 caracteres.'),
  phoneNumber: z
    .string()
    .trim()
    .min(9, 'Introduza um número com pelo menos 9 dígitos.')
    .max(20, 'Máximo 20 caracteres.'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// A plain `ClientFormValues`, not `DefaultValues<…>`: every field is a string
// with a real empty value, so there is nothing partial about it.
export const clientFormDefaults: ClientFormValues = { name: '', email: '', phoneNumber: '' };

export interface ClientFormProps {
  register: UseFormRegister<ClientFormValues>;
  errors: FieldErrors<ClientFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  busyLabel: string;
}

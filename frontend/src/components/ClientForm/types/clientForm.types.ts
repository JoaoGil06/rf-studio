import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

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

export const clientFormDefaults: ClientFormValues = { name: '', email: '', phoneNumber: '' };

export interface ClientFormProps {
  register: UseFormRegister<ClientFormValues>;
  errors: FieldErrors<ClientFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  busyLabel: string;
  // 'bar' is the page's inline add strip, which supplies its own panel chrome.
  // 'stacked' is hosted inside `Modal`, whose sheet supplies it instead.
  layout: 'bar' | 'stacked';
}

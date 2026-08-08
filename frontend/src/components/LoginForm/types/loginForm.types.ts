import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

/**
 * The component renders these two fields, so it owns their shape and the pt-PT
 * message each one fails with. The page imports `loginSchema` for its resolver —
 * the dependency points page → component, never the other way.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Introduza o seu email.').pipe(z.email('Email inválido.')),
  password: z.string().min(1, 'Introduza a palavra-passe.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
}

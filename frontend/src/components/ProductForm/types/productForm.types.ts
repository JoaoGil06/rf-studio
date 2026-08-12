import type { FormEventHandler } from 'react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import type { ProductCategory } from '../../../utils/constants/productCategories';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Introduza o nome.').max(100, 'Máximo 100 caracteres.'),
  brand: z.string().trim().min(1, 'Introduza a marca.').max(100, 'Máximo 100 caracteres.'),
  color: z
    .string()
    .trim()
    .min(1, 'Introduza a cor.')
    .max(50, 'Máximo 50 caracteres.'),
  isAvailable: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

/**
 * A function, not a constant: the colour default differs per category, because
 * `<input type="color">` can never be empty and a text field starts that way.
 * See `colourDefault` in productCategories.ts.
 */
export function productFormDefaults(category: ProductCategory): ProductFormValues {
  return { name: '', brand: '', color: category.colourDefault, isAvailable: true };
}

export interface ProductFormProps {
  category: ProductCategory;
  register: UseFormRegister<ProductFormValues>;
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
  /** "ADICIONAR" on the add sheet, "GUARDAR" on the edit sheet. */
  submitLabel: string;
  /** Shown in its place while the mutation is in flight. */
  busyLabel: string;
}

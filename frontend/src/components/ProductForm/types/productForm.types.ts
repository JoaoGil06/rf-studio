import type { FormEventHandler } from 'react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import type { ProductCategory } from '../../../utils/constants/productCategories';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Introduza o nome.').max(100, 'Máximo 100 caracteres.'),
  brand: z.string().trim().min(1, 'Introduza a marca.').max(100, 'Máximo 100 caracteres.'),
  color: z.string().trim().max(50, 'Máximo 50 caracteres.'),
  isAvailable: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  name: '',
  brand: '',
  color: '',
  isAvailable: true,
};

export interface ProductFormProps {
  category: ProductCategory;
  register: UseFormRegister<ProductFormValues>;
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
}

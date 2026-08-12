import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { isBadUserInput } from '../../../graphql/errors';
import { PRODUCT_CATEGORIES } from '../../../utils/constants/productCategories';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { productSchema, type ProductFormValues } from '../../ProductForm/types/productForm.types';
import { useEditProductModalModel } from '../model/editProductModal.model';

export const EDIT_PRODUCT_LABELS = {
  submit: 'GUARDAR',
  busy: 'A GUARDAR…',
} as const;

export function useEditProductModalViewModel(productId: string | null) {
  const { product, updateProduct, isSaving } = useEditProductModalModel(productId);

  const category = useMemo(
    () => PRODUCT_CATEGORIES.find((entry) => entry.value === product?.category) ?? null,
    [product?.category],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema), mode: 'onSubmit' });

  useEffect(() => {
    if (!product) {
      return;
    }

    reset({
      name: product.name,
      brand: product.brand,
      color: product.color ?? '',
      isAvailable: product.isAvailable,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, reset]);

  const submit = useCallback(
    async (values: ProductFormValues): Promise<boolean> => {
      if (!productId) {
        return false;
      }

      try {
        const { data: result } = await updateProduct({
          variables: {
            input: {
              id: productId,
              name: values.name,
              brand: values.brand,
              color: values.color,
              isAvailable: values.isAvailable,
            },
          },
        });

        if (!result) {
          setError('root', { message: PRODUCT_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.updateProduct.__typename) {
          case 'UpdateProductSuccess':
            return true;

          case 'ProductAlreadyExistsError':
            setError('root', { message: PRODUCT_ERROR_MESSAGES.alreadyExists });
            return false;

          case 'ProductNotFoundError':
            setError('root', { message: PRODUCT_ERROR_MESSAGES.notFound });
            return false;
        }
      } catch (mutationError) {
        setError('root', {
          message: isBadUserInput(mutationError)
            ? PRODUCT_ERROR_MESSAGES.badInput
            : PRODUCT_ERROR_MESSAGES.network,
        });

        return false;
      }
    },
    [updateProduct, productId, setError],
  );

  const title = useMemo(() => (category ? `Editar ${category.noun}` : ''), [category]);

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return {
    category,
    title,
    submitLabel: EDIT_PRODUCT_LABELS.submit,
    busyLabel: EDIT_PRODUCT_LABELS.busy,
    register,
    control,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting: isSaving,
  };
}

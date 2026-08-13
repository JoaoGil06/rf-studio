import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { isBadUserInput } from '../../../graphql/errors';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import {
  productFormDefaults,
  productSchema,
  type ProductFormValues,
} from '../../../components/ProductForm/types/productForm.types';
import { CATEGORY_PARAM, type CategoryDescriptor } from '../../../utils/constants/categories';
import { PRODUCT_CATEGORIES } from '../../../utils/constants/productCategories';
import { PRODUCT_ERROR_MESSAGES } from '../../../utils/constants/productMessages';
import { findCategoryBySlug } from '../../../utils/helpers/productCategories';
import { useProductsModel } from '../model/products.model';

export function useProductsViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = useMemo(
    () => findCategoryBySlug(searchParams.get(CATEGORY_PARAM)),
    [searchParams],
  );

  const { data, loading, error, isLoadingMore, canLoadMore, loadMore, registerProduct } =
    useProductsModel(category.value);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onSubmit',
    defaultValues: productFormDefaults(category),
  });

  const selectCategory = useCallback(
    (next: CategoryDescriptor) => {
      setSearchParams({ [CATEGORY_PARAM]: next.slug }, { replace: true });
    },
    [setSearchParams],
  );

  const productIds = useMemo(
    () => (data?.products.edges ?? []).map((edge) => edge.node.id),
    [data],
  );

  // Cursors, page size and the fetchMore call belong to the Model; what is left
  // here is the wiring — which element the sentinel hangs on, and when it watches.
  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, enabled: canLoadMore });

  const resetForm = useCallback(
    () => reset(productFormDefaults(category)),
    [reset, category],
  );

  const submit = useCallback(
    async (values: ProductFormValues): Promise<boolean> => {
      try {
        const { data: result } = await registerProduct({
          variables: {
            input: {
              name: values.name,
              brand: values.brand,
              color: values.color,
              isAvailable: values.isAvailable,
              category: category.value, // Injected from the active tab — never asked for on the form.
            },
          },
        });

        if (!result) {
          setError('root', { message: PRODUCT_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.registerProduct.__typename) {
          case 'RegisterProductSuccess':
            // The refetch has already landed (awaitRefetchQueries), so the new card
            // is on the grid behind the sheet by the time the sheet closes over it.
            return true;

          case 'ProductAlreadyExistsError':
            setError('root', { message: PRODUCT_ERROR_MESSAGES.alreadyExists });
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
    [registerProduct, category, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  const loadError = useMemo(() => (error ? PRODUCT_ERROR_MESSAGES.load : null), [error]);

  return {
    categories: PRODUCT_CATEGORIES,
    category,
    selectCategory,
    productIds,
    sentinelRef,
    isLoading: loading,
    isLoadingMore,
    loadError,
    resetForm,
    register,
    control,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  };
}

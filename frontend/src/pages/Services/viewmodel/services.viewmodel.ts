import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import {
  serviceFormDefaults,
  serviceSchema,
  type ServiceFormValues,
} from '../../../components/ServiceForm/types/serviceForm.types';
import { isBadUserInput } from '../../../graphql/errors';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { CATEGORY_PARAM, type CategoryDescriptor } from '../../../utils/constants/categories';
import { SERVICE_CATEGORIES } from '../../../utils/constants/serviceCategories';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { findServiceCategoryBySlug } from '../../../utils/helpers/serviceCategories';
import { useServicesModel } from '../model/services.model';

export function useServicesViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = useMemo(
    () => findServiceCategoryBySlug(searchParams.get(CATEGORY_PARAM)),
    [searchParams],
  );

  const { data, loading, error, isLoadingMore, canLoadMore, loadMore, registerService } =
    useServicesModel(category.value);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: 'onSubmit',
    defaultValues: serviceFormDefaults,
  });

  const selectCategory = useCallback(
    (next: CategoryDescriptor) => {
      setSearchParams({ [CATEGORY_PARAM]: next.slug }, { replace: true });
    },
    [setSearchParams],
  );

  const serviceIds = useMemo(
    () => (data?.services.edges ?? []).map((edge) => edge.node.id),
    [data],
  );

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, enabled: canLoadMore });

  const resetForm = useCallback(() => reset(serviceFormDefaults), [reset]);

  const submit = useCallback(
    async (values: ServiceFormValues): Promise<boolean> => {
      try {
        const { data: result } = await registerService({
          variables: {
            input: {
              name: values.name,
              price: values.price,
              durationMinutes: values.durationMinutes,
              category: category.value, // Injected from the active tab — never asked for on the form.
            },
          },
        });

        if (!result) {
          setError('root', { message: SERVICE_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.registerService.__typename) {
          case 'RegisterServiceSuccess':
            // The refetch has already landed (awaitRefetchQueries), so the new card
            // is on the grid behind the sheet by the time the sheet closes over it.
            return true;

          case 'ServiceAlreadyExistsError':
            setError('root', { message: SERVICE_ERROR_MESSAGES.alreadyExists });
            return false;
        }
      } catch (mutationError) {
        setError('root', {
          message: isBadUserInput(mutationError)
            ? SERVICE_ERROR_MESSAGES.badInput
            : SERVICE_ERROR_MESSAGES.network,
        });

        return false;
      }
    },
    [registerService, category, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  const loadError = useMemo(() => (error ? SERVICE_ERROR_MESSAGES.load : null), [error]);

  return {
    categories: SERVICE_CATEGORIES,
    category,
    selectCategory,
    serviceIds,
    sentinelRef,
    isLoading: loading,
    isLoadingMore,
    loadError,
    resetForm,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  };
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { isBadUserInput, isServerRejection } from '../../../graphql/errors';
import { toSlotKey } from '../../../lib/date/slots';
import { formatDayMonth } from '../../../lib/format/date';
import { formatEuros } from '../../../lib/format/money';
import { COMPLETE_COPY, SCHEDULE_ERROR_MESSAGES } from '../../../utils/constants/scheduleMessages';
import { SERVICE_CATEGORIES } from '../../../utils/constants/serviceCategories';
import type {
  ProductOption,
  ProductOptionGroup,
} from '../../ProductPicker/types/productPicker.types';
import { useCompleteReservationModalModel } from '../model/completeReservationModal.model';
import {
  completeReservationDefaults,
  completeReservationSchema,
  type CompleteReservationFormValues,
} from '../types/completeReservationModal.types';

const UNKNOWN_TOTAL = '—';

/** Chosen products leave the select, which is also what makes adding one twice impossible. */
function toBrandGroups(
  options: readonly ProductOption[],
  chosenIds: readonly string[],
): ProductOptionGroup[] {
  const byBrand = new Map<string, ProductOption[]>();

  for (const option of options) {
    if (chosenIds.includes(option.id)) {
      continue;
    }

    byBrand.set(option.brand, [...(byBrand.get(option.brand) ?? []), option]);
  }

  return [...byBrand].map(([label, grouped]) => ({ label, options: grouped }));
}

export function useCompleteReservationModalViewModel(
  scheduleId: string,
  productOptions: readonly ProductOption[],
  hasMoreProducts: boolean,
  isLoadingProducts: boolean,
) {
  const { reservation, completeSchedule, isSaving } = useCompleteReservationModalModel(scheduleId);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitted },
  } = useForm<CompleteReservationFormValues>({
    resolver: zodResolver(completeReservationSchema),
    mode: 'onSubmit',
    defaultValues: completeReservationDefaults,
  });

  const productIds = useWatch({ control, name: 'productIds' });
  const tip = useWatch({ control, name: 'tip' });

  // Revalidates once a submit has failed, so the "at least 1" error clears on the
  // add that resolves it rather than on the next submit.
  const setProductIds = useCallback(
    (next: string[]) => setValue('productIds', next, { shouldValidate: isSubmitted }),
    [setValue, isSubmitted],
  );

  const addProduct = useCallback(
    (id: string) => {
      const current = getValues('productIds');

      if (id && !current.includes(id)) {
        setProductIds([...current, id]);
      }
    },
    [getValues, setProductIds],
  );

  const removeProduct = useCallback(
    (id: string) => setProductIds(getValues('productIds').filter((chosenId) => chosenId !== id)),
    [getValues, setProductIds],
  );

  const serviceCategory = reservation?.service.category;

  const ofCategory = useMemo(
    () => productOptions.filter((option) => option.category === serviceCategory),
    [productOptions, serviceCategory],
  );

  const chosen = useMemo(
    () => productIds.flatMap((id) => ofCategory.find((option) => option.id === id) ?? []),
    [productIds, ofCategory],
  );

  const groups = useMemo(() => toBrandGroups(ofCategory, productIds), [ofCategory, productIds]);

  const isPickerEmpty = useMemo(
    () => !isLoadingProducts && ofCategory.length === 0 && !hasMoreProducts,
    [isLoadingProducts, ofCategory.length, hasMoreProducts],
  );

  const title = useMemo(() => {
    if (!reservation) {
      return null;
    }

    const date = new Date(reservation.date);
    return `${formatDayMonth(date, new Date().getFullYear())} às ${toSlotKey(date)}`;
  }, [reservation]);

  const subject = useMemo(
    () => (reservation ? `${reservation.user.name} · ${reservation.service.name}` : ''),
    [reservation],
  );

  const note = useMemo(() => {
    if (isPickerEmpty) {
      const category = SERVICE_CATEGORIES.find((candidate) => candidate.value === serviceCategory);

      return COMPLETE_COPY.noProducts(category?.title ?? '');
    }

    return hasMoreProducts ? COMPLETE_COPY.partialProducts : null;
  }, [isPickerEmpty, hasMoreProducts, serviceCategory]);

  const total = useMemo(() => {
    const tipAmount = typeof tip === 'number' && Number.isFinite(tip) ? tip : 0;

    return formatEuros((reservation?.finalPrice ?? 0) + tipAmount) ?? UNKNOWN_TOTAL;
  }, [reservation?.finalPrice, tip]);

  const submit = useCallback(
    async (values: CompleteReservationFormValues): Promise<boolean> => {
      try {
        const { data: result } = await completeSchedule({
          variables: {
            input: { scheduleId, productIds: values.productIds, tip: values.tip },
          },
        });

        if (!result) {
          setError('root', { message: SCHEDULE_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.completeSchedule.__typename) {
          case 'CompleteScheduleSuccess':
            return true;

          case 'ScheduleNotFoundError':
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.notFound });
            return false;

          case 'ServiceNotFoundError':
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.serviceNotFound });
            return false;

          // The refetch brings the new list; the stale id must not be sent again.
          case 'ProductNotFoundError':
            setValue('productIds', []);
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.productNotFound });
            return false;

          // The resolver maps every ConflictError here: another device moved it first.
          case 'ScheduleNotCompletableError':
            setError('root', { message: SCHEDULE_ERROR_MESSAGES.statusChanged });
            return false;
        }
      } catch (mutationError) {
        let message: string = SCHEDULE_ERROR_MESSAGES.network;

        if (isBadUserInput(mutationError)) {
          message = SCHEDULE_ERROR_MESSAGES.badInput;
        } else if (isServerRejection(mutationError)) {
          message = SCHEDULE_ERROR_MESSAGES.completeFailed;
        }

        setError('root', { message });
        return false;
      }
    },
    [completeSchedule, scheduleId, setError, setValue],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return {
    register,
    handleSubmit,
    submit,
    errors,
    title,
    subject,
    groups,
    chosen,
    addProduct,
    removeProduct,
    note,
    isPickerEmpty,
    total,
    formError,
    isSaving,
  };
}

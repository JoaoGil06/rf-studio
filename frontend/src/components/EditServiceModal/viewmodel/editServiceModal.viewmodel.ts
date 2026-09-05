import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { isBadUserInput } from '../../../graphql/errors';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { serviceSchema, type ServiceFormValues } from '../../ServiceForm/types/serviceForm.types';
import { useEditServiceModalModel } from '../model/editServiceModal.model';

export const EDIT_SERVICE_LABELS = {
  title: 'Editar serviço',
  submit: 'GUARDAR',
  busy: 'A GUARDAR…',
} as const;

export function useEditServiceModalViewModel(serviceId: string | null) {
  const { service, updateService, isSaving } = useEditServiceModalModel(serviceId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema), mode: 'onSubmit' });

  useEffect(() => {
    if (!service) {
      return;
    }

    reset({
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, reset]);

  const submit = useCallback(
    async (values: ServiceFormValues): Promise<boolean> => {
      if (!serviceId) {
        return false;
      }

      try {
        const { data: result } = await updateService({
          variables: {
            input: {
              id: serviceId,
              name: values.name,
              price: values.price,
              durationMinutes: values.durationMinutes,
            },
          },
        });

        if (!result) {
          setError('root', { message: SERVICE_ERROR_MESSAGES.network });
          return false;
        }

        switch (result.updateService.__typename) {
          case 'UpdateServiceSuccess':
            return true;

          case 'ServiceAlreadyExistsError':
            setError('root', { message: SERVICE_ERROR_MESSAGES.alreadyExists });
            return false;

          case 'ServiceNotFoundError':
            setError('root', { message: SERVICE_ERROR_MESSAGES.notFound });
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
    [updateService, serviceId, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return {
    service,
    title: EDIT_SERVICE_LABELS.title,
    submitLabel: EDIT_SERVICE_LABELS.submit,
    busyLabel: EDIT_SERVICE_LABELS.busy,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting: isSaving,
  };
}

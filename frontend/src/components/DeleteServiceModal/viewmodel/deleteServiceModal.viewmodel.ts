import { useCallback } from 'react';
import { isBadUserInput } from '../../../graphql/errors';
import { SERVICE_ERROR_MESSAGES } from '../../../utils/constants/serviceMessages';
import { useDeleteServiceModalModel } from '../model/deleteServiceModal.model';

export const DELETE_SERVICE_LABELS = {
  title: 'Remover serviço',
  keep: 'MANTER',
  remove: 'REMOVER',
} as const;

export function useDeleteServiceModalViewModel(serviceId: string | null) {
  const { service, deleteService, isDeleting } = useDeleteServiceModalModel(serviceId);

  const confirm = useCallback(async (): Promise<string | null> => {
    if (!serviceId) {
      return SERVICE_ERROR_MESSAGES.deleteFailed;
    }

    try {
      const { data: result } = await deleteService({ variables: { input: { id: serviceId } } });

      if (!result) {
        return SERVICE_ERROR_MESSAGES.network;
      }

      switch (result.deleteService.__typename) {
        case 'DeleteServiceSuccess':
          return null;

        case 'ServiceNotFoundError':
          return SERVICE_ERROR_MESSAGES.notFound;
      }
    } catch (mutationError) {
      return isBadUserInput(mutationError)
        ? SERVICE_ERROR_MESSAGES.badInput
        : SERVICE_ERROR_MESSAGES.network;
    }
  }, [deleteService, serviceId]);

  return {
    name: service?.name ?? null,
    confirm,
    isDeleting,
    title: DELETE_SERVICE_LABELS.title,
    keepLabel: DELETE_SERVICE_LABELS.keep,
    removeLabel: DELETE_SERVICE_LABELS.remove,
  };
}

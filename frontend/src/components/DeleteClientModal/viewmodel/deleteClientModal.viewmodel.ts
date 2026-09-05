import { useCallback } from 'react';
import { isBadUserInput, isServerRejection } from '../../../graphql/errors';
import { CLIENT_ERROR_MESSAGES } from '../../../utils/constants/clientMessages';
import { useDeleteClientModalModel } from '../model/deleteClientModal.model';

export const DELETE_CLIENT_LABELS = {
  title: 'Remover cliente',
  keep: 'MANTER',
  remove: 'REMOVER',
} as const;

export function useDeleteClientModalViewModel(clientId: string | null) {
  const { client, deleteClient, isDeleting } = useDeleteClientModalModel(clientId);

  const confirm = useCallback(async (): Promise<string | null> => {
    if (!clientId) {
      return CLIENT_ERROR_MESSAGES.deleteFailed;
    }

    try {
      const { data: result } = await deleteClient({ variables: { input: { id: clientId } } });

      if (!result) {
        return CLIENT_ERROR_MESSAGES.network;
      }

      switch (result.deleteUser.__typename) {
        case 'DeleteUserSuccess':
          return null;

        case 'UserNotFoundError':
          return CLIENT_ERROR_MESSAGES.notFound;
      }
    } catch (mutationError) {
      if (isBadUserInput(mutationError)) {
        return CLIENT_ERROR_MESSAGES.badInput;
      }

      if (isServerRejection(mutationError)) {
        return CLIENT_ERROR_MESSAGES.deleteFailed;
      }

      return CLIENT_ERROR_MESSAGES.network;
    }
  }, [deleteClient, clientId]);

  return {
    name: client?.name ?? null,
    confirm,
    isDeleting,
    title: DELETE_CLIENT_LABELS.title,
    keepLabel: DELETE_CLIENT_LABELS.keep,
    removeLabel: DELETE_CLIENT_LABELS.remove,
  };
}

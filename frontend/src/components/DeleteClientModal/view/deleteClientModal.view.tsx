import { ConfirmDialog } from '../../ConfirmDialog';
import type { DeleteClientModalProps } from '../types/deleteClientModal.types';
import { useDeleteClientModalViewModel } from '../viewmodel/deleteClientModal.viewmodel';

export function DeleteClientModal({ clientId, onClose }: DeleteClientModalProps) {
  const { name, confirm, isDeleting, title, keepLabel, removeLabel } =
    useDeleteClientModalViewModel(clientId);

  if (!clientId || !name) {
    return null;
  }

  return (
    <ConfirmDialog
      isOpen
      title={title}
      name={name}
      keepLabel={keepLabel}
      removeLabel={removeLabel}
      isBusy={isDeleting}
      onClose={onClose}
      onConfirm={confirm}
    />
  );
}

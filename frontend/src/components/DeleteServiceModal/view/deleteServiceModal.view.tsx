import { ConfirmDialog } from '../../ConfirmDialog';
import type { DeleteServiceModalProps } from '../types/deleteServiceModal.types';
import { useDeleteServiceModalViewModel } from '../viewmodel/deleteServiceModal.viewmodel';

export function DeleteServiceModal({ serviceId, onClose }: DeleteServiceModalProps) {
  const { name, confirm, isDeleting, title, keepLabel, removeLabel } =
    useDeleteServiceModalViewModel(serviceId);

  if (!serviceId || !name) {
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

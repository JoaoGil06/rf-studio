import { ConfirmDialog } from '../../ConfirmDialog';
import type { ReservationStatusModalProps } from '../types/reservationStatusModal.types';
import { useReservationStatusModalViewModel } from '../viewmodel/reservationStatusModal.viewmodel';

export function ReservationStatusModal({ scheduleId, kind, onClose }: ReservationStatusModalProps) {
  const { subject, title, verb, consequence, keepLabel, actLabel, tone, isUpdating, confirm } =
    useReservationStatusModalViewModel(scheduleId, kind);

  if (!subject) {
    return null;
  }

  return (
    <ConfirmDialog
      isOpen
      title={title}
      name={subject}
      verb={verb}
      consequence={consequence}
      tone={tone}
      keepLabel={keepLabel}
      removeLabel={actLabel}
      isBusy={isUpdating}
      onClose={onClose}
      onConfirm={confirm}
    />
  );
}

import { useCallback, useMemo } from 'react';
import { BOOKING_COPY } from '../../../utils/constants/scheduleMessages';
import { BookingForm } from '../../BookingForm';
import { Modal } from '../../Modal';
import type { NewReservationModalProps } from '../types/newReservationModal.types';
import { useNewReservationModalViewModel } from '../viewmodel/newReservationModal.viewmodel';

export function NewReservationModal({
  day,
  clients,
  serviceGroups,
  truncatedNote,
  onClose,
}: NewReservationModalProps) {
  const {
    register,
    handleSubmit,
    submit,
    resetForm,
    errors,
    formError,
    isSaving,
    slots,
    isTimeLocked,
  } = useNewReservationModalViewModel(day, serviceGroups);

  const close = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          close();
        }
      }),
    [handleSubmit, submit, close],
  );

  return (
    <Modal
      isOpen={day !== null}
      onClose={close}
      whisper={BOOKING_COPY.whisper}
      title={day?.label ?? ''}
    >
      {day && (
        <BookingForm
          register={register}
          errors={errors}
          onSubmit={onSubmit}
          formError={formError}
          isSubmitting={isSaving}
          slots={slots}
          isTimeLocked={isTimeLocked}
          clients={clients}
          serviceGroups={serviceGroups}
          truncatedNote={truncatedNote}
          submitLabel={BOOKING_COPY.submit}
          busyLabel={BOOKING_COPY.busy}
        />
      )}
    </Modal>
  );
}

import { useMemo } from 'react';
import { Modal } from '../../Modal';
import { ServiceForm } from '../../ServiceForm';
import type { EditServiceModalProps } from '../types/editServiceModal.types';
import { useEditServiceModalViewModel } from '../viewmodel/editServiceModal.viewmodel';

export function EditServiceModal({ serviceId, onClose }: EditServiceModalProps) {
  const {
    service,
    title,
    submitLabel,
    busyLabel,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  } = useEditServiceModalViewModel(serviceId);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          onClose();
        }
      }),
    [handleSubmit, submit, onClose],
  );

  if (!serviceId || !service) {
    return null;
  }

  return (
    <Modal isOpen onClose={onClose} title={title}>
      <ServiceForm
        register={register}
        errors={errors}
        onSubmit={onSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        busyLabel={busyLabel}
      />
    </Modal>
  );
}

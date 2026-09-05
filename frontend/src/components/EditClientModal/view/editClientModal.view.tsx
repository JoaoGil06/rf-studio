import { useMemo } from 'react';
import { ClientForm } from '../../ClientForm';
import { Modal } from '../../Modal';
import type { EditClientModalProps } from '../types/editClientModal.types';
import { useEditClientModalViewModel } from '../viewmodel/editClientModal.viewmodel';

export function EditClientModal({ clientId, onClose }: EditClientModalProps) {
  const {
    client,
    title,
    submitLabel,
    busyLabel,
    register,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  } = useEditClientModalViewModel(clientId);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          onClose();
        }
      }),
    [handleSubmit, submit, onClose],
  );

  if (!clientId || !client) {
    return null;
  }

  return (
    <Modal isOpen onClose={onClose} title={title}>
      <ClientForm
        register={register}
        errors={errors}
        onSubmit={onSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        busyLabel={busyLabel}
        layout="stacked"
      />
    </Modal>
  );
}

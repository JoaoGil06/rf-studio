import { useMemo } from 'react';
import { Modal } from '../../Modal';
import { ProductForm } from '../../ProductForm';
import type { EditProductModalProps } from '../types/editProductModal.types';
import { useEditProductModalViewModel } from '../viewmodel/editProductModal.viewmodel';

export function EditProductModal({ productId, onClose }: EditProductModalProps) {
  const {
    category,
    title,
    submitLabel,
    busyLabel,
    register,
    control,
    handleSubmit,
    submit,
    errors,
    formError,
    isSubmitting,
  } = useEditProductModalViewModel(productId);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          onClose();
        }
      }),
    [handleSubmit, submit, onClose],
  );

  if (!productId || !category) {
    return null;
  }

  return (
    <Modal isOpen onClose={onClose} title={title}>
      <ProductForm
        category={category}
        register={register}
        control={control}
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

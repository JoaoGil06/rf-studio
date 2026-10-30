import { useId, useMemo } from 'react';
import { COMPLETE_COPY } from '../../../utils/constants/scheduleMessages';
import { Modal } from '../../Modal';
import { ProductPicker } from '../../ProductPicker';
import {
  parseTip,
  type CompleteReservationModalProps,
} from '../types/completeReservationModal.types';
import { useCompleteReservationModalViewModel } from '../viewmodel/completeReservationModal.viewmodel';
import styles from './completeReservationModal.view.module.css';

export function CompleteReservationModal({
  scheduleId,
  productOptions,
  hasMoreProducts,
  isLoadingProducts,
  onClose,
}: CompleteReservationModalProps) {
  const {
    register,
    handleSubmit,
    submit,
    errors,
    title,
    subject,
    groups,
    chosen,
    addProduct,
    removeProduct,
    note,
    isPickerEmpty,
    total,
    formError,
    isSaving,
  } = useCompleteReservationModalViewModel(
    scheduleId,
    productOptions,
    hasMoreProducts,
    isLoadingProducts,
  );

  const fieldId = useId();
  const productsId = `${fieldId}-products`;
  const tipId = `${fieldId}-tip`;
  const tipErrorId = `${tipId}-error`;

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (await submit(values)) {
          onClose();
        }
      }),
    [handleSubmit, submit, onClose],
  );

  if (!title) {
    return null;
  }

  return (
    <Modal isOpen onClose={onClose} whisper={COMPLETE_COPY.whisper} title={title}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <p className={styles.subject}>{subject}</p>
        <p className={styles.note}>{COMPLETE_COPY.consequence}</p>

        {note && <p className={styles.note}>{note}</p>}

        {!isPickerEmpty && (
          <ProductPicker
            id={productsId}
            label={COMPLETE_COPY.productsLabel}
            placeholder={COMPLETE_COPY.addPlaceholder}
            groups={groups}
            chosen={chosen}
            removeVerb={COMPLETE_COPY.removeVerb}
            isDisabled={isLoadingProducts}
            error={errors.productIds?.message}
            onAdd={addProduct}
            onRemove={removeProduct}
          />
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor={tipId}>
            {COMPLETE_COPY.tipLabel}
          </label>
          <input
            className={styles.input}
            id={tipId}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            autoComplete="off"
            aria-invalid={errors.tip ? true : undefined}
            aria-describedby={errors.tip ? tipErrorId : undefined}
            {...register('tip', { setValueAs: parseTip })}
          />
          {errors.tip && (
            <span className={styles.fieldError} id={tipErrorId}>
              {errors.tip.message}
            </span>
          )}
        </div>

        <div className={styles.total}>
          <span className={styles.totalLabel}>{COMPLETE_COPY.totalLabel}</span>
          <span className={styles.totalValue}>{total}</span>
        </div>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.keep} onClick={onClose} disabled={isSaving}>
            {COMPLETE_COPY.keep}
          </button>
          <button type="submit" className={styles.submit} disabled={isSaving || isPickerEmpty}>
            {isSaving ? COMPLETE_COPY.busy : COMPLETE_COPY.submit}
          </button>
        </div>
      </form>
    </Modal>
  );
}

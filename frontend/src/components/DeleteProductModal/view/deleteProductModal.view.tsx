import { useCallback, useMemo, useState } from 'react';
import { Modal } from '../../Modal';
import type { DeleteProductModalProps } from '../types/deleteProductModal.types';
import { useDeleteProductModalViewModel } from '../viewmodel/deleteProductModal.viewmodel';
import styles from './deleteProductModal.view.module.css';

export function DeleteProductModal({ productId, onClose }: DeleteProductModalProps) {
  const { name, confirm, isDeleting, title, keepLabel, removeLabel } =
    useDeleteProductModalViewModel(productId);

  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    const failure = await confirm();
    if (failure) {
      setError(failure);
      return;
    }

    onClose();
  }, [confirm, onClose]);

  const keepClassName = useMemo(() => `${styles.pill} ${styles.pillKeep}`, []);
  const removeClassName = useMemo(() => `${styles.pill} ${styles.pillRemove}`, []);

  if (!productId || !name) {
    return null;
  }

  return (
    <Modal isOpen onClose={onClose} title={title}>
      <div className={styles.body}>
        <p className={styles.question}>
          Remover <b className={styles.name}>{name}</b>?
        </p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={keepClassName} onClick={onClose} disabled={isDeleting}>
            {keepLabel}
          </button>
          <button
            type="button"
            className={removeClassName}
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {removeLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

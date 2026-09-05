import { useCallback, useMemo, useState } from 'react';
import { Modal } from '../../Modal';
import type { ConfirmDialogProps } from '../types/confirmDialog.types';
import styles from './confirmDialog.view.module.css';

export function ConfirmDialog({
  isOpen,
  title,
  name,
  keepLabel,
  removeLabel,
  isBusy,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    const failure = await onConfirm();
    if (failure) {
      setError(failure);
      return;
    }

    onClose();
  }, [onConfirm, onClose]);

  const keepClassName = useMemo(() => `${styles.pill} ${styles.pillKeep}`, []);
  const removeClassName = useMemo(() => `${styles.pill} ${styles.pillRemove}`, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
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
          <button type="button" className={keepClassName} onClick={onClose} disabled={isBusy}>
            {keepLabel}
          </button>
          <button
            type="button"
            className={removeClassName}
            onClick={handleConfirm}
            disabled={isBusy}
          >
            {removeLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

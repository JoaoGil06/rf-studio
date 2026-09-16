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
  verb = 'Remover',
  consequence,
  tone = 'danger',
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
  const actClassName = useMemo(
    () => (tone === 'primary' ? styles.primary : `${styles.pill} ${styles.pillRemove}`),
    [tone],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.body}>
        <p className={styles.question}>
          {verb} <b className={styles.name}>{name}</b>?
        </p>

        {consequence && <p className={styles.consequence}>{consequence}</p>}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={keepClassName} onClick={onClose} disabled={isBusy}>
            {keepLabel}
          </button>
          <button type="button" className={actClassName} onClick={handleConfirm} disabled={isBusy}>
            {removeLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

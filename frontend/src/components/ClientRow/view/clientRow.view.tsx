import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { CloseIcon, PencilIcon } from '../../icons';
import type { ClientRowProps } from '../types/clientRow.types';
import { useClientRowViewModel } from '../viewmodel/clientRow.viewmodel';
import styles from './clientRow.view.module.css';

export function ClientRow({ id, onEdit, onDelete }: ClientRowProps) {
  const viewModel = useClientRowViewModel(id);

  const [isRevealed, setIsRevealed] = useState(false);

  const toggleRevealed = useCallback(() => setIsRevealed((wasRevealed) => !wasRevealed), []);

  const rowClassName = useMemo(
    () => (isRevealed ? `${styles.row} ${styles.rowRevealed}` : styles.row),
    [isRevealed],
  );

  const deleteClassName = useMemo(() => `${styles.action} ${styles.actionDanger}`, []);

  const handleEdit = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // Without this the press would also toggle the row underneath it.
      event.stopPropagation();
      onEdit(id);
    },
    [onEdit, id],
  );

  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete(id);
    },
    [onDelete, id],
  );

  if (!viewModel) {
    return null;
  }

  return (
    <article className={rowClassName} onClick={toggleRevealed}>
      <span className={styles.avatar} aria-hidden="true">
        {viewModel.initial}
      </span>

      <div className={styles.body}>
        <div className={styles.name}>{viewModel.name}</div>
        <div className={styles.meta}>
          <span className={styles.phone}>{viewModel.phoneNumber}</span>
          <span className={styles.email}>{viewModel.email}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.action}
          aria-label={viewModel.editLabel}
          onClick={handleEdit}
        >
          <PencilIcon className={styles.actionIcon} />
        </button>
        <button
          type="button"
          className={deleteClassName}
          aria-label={viewModel.deleteLabel}
          onClick={handleDelete}
        >
          <CloseIcon className={styles.actionIcon} />
        </button>
      </div>
    </article>
  );
}

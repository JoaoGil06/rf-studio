import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { CloseIcon, PencilIcon } from '../../icons';
import type { ServiceCardProps } from '../types/serviceCard.types';
import { useServiceCardViewModel } from '../viewmodel/serviceCard.viewmodel';
import styles from './serviceCard.view.module.css';

export function ServiceCard({ id, onEdit, onDelete }: ServiceCardProps) {
  const viewModel = useServiceCardViewModel(id);
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleRevealed = useCallback(() => setIsRevealed((wasRevealed) => !wasRevealed), []);

  const cardClassName = useMemo(
    () => (isRevealed ? `${styles.card} ${styles.cardRevealed}` : styles.card),
    [isRevealed],
  );

  const deleteClassName = useMemo(() => `${styles.action} ${styles.actionDanger}`, []);

  const handleEdit = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
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
    <article className={cardClassName} onClick={toggleRevealed}>
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

      <span className={styles.initial} aria-hidden="true">
        {viewModel.initial}
      </span>

      <div>
        <div className={styles.name}>{viewModel.name}</div>
        <div className={styles.meta}>{viewModel.metaLabel}</div>
      </div>

      <div className={styles.price}>{viewModel.price}</div>
    </article>
  );
}

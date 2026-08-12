import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { CloseIcon, PencilIcon } from '../../icons';
import type { ProductCardProps } from '../types/productCard.types';
import { useProductCardViewModel } from '../viewmodel/productCard.viewmodel';
import styles from './productCard.view.module.css';

interface SwatchProps {
  colour: string | null;
  initial: string;
}

function Swatch({ colour, initial }: SwatchProps) {
  const style = useMemo(() => (colour ? { background: colour } : undefined), [colour]);

  const className = useMemo(
    () => (colour ? styles.swatch : `${styles.swatch} ${styles.swatchFallback}`),
    [colour],
  );

  return (
    <span className={className} style={style} aria-hidden="true">
      {colour ? null : initial}
    </span>
  );
}

export function ProductCard({ id, onEdit, onDelete }: ProductCardProps) {
  const viewModel = useProductCardViewModel(id);

  // Touch has no hover, and the actions must not sit permanently on a 190px card
  // that already carries a swatch, a name, a meta line and a brand. Cannot be
  // derived: nothing outside this card knows a finger landed on it, it is not
  // server state, not form state, and which card was poked is not a place in the
  // app — so it must not go in the URL either.
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleRevealed = useCallback(() => setIsRevealed((wasRevealed) => !wasRevealed), []);

  const cardClassName = useMemo(
    () => (isRevealed ? `${styles.card} ${styles.cardRevealed}` : styles.card),
    [isRevealed],
  );

  const deleteClassName = useMemo(() => `${styles.action} ${styles.actionDanger}`, []);

  // stopPropagation so pressing an action does not also fire the card's toggle.
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

  /**
   * No `role="button"` or `tabIndex` on the article. The card is not a button, and
   * claiming it is would swallow the semantics of the two real buttons inside it.
   * The click handler is a touch-only enhancement; the keyboard reaches the actions
   * through `:focus-within`, which needs no role.
   */
  return (
    <article className={cardClassName} onClick={toggleRevealed}>
      {/* Mounted and focusable at opacity 0, never conditionally rendered: an
          unmounted button cannot receive focus, so `:focus-within` would never
          match and Modal's focus restore would drop to <body> on close. */}
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

      <Swatch colour={viewModel.swatchColour} initial={viewModel.initial} />
      <span className={styles.swatchLabel}>{viewModel.swatchLabel}</span>

      <div>
        <div className={styles.name}>{viewModel.name}</div>
        <div className={styles.meta}>{viewModel.metaLabel}</div>
      </div>

      <div className={styles.brand}>{viewModel.brand}</div>

      {!viewModel.isAvailable && <span className={styles.veil} aria-hidden="true" />}
    </article>
  );
}

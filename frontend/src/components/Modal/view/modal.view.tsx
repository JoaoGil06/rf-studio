import { createPortal } from 'react-dom';
import { CloseIcon } from '../../icons';
import type { ModalProps } from '../types/modal.types';
import { useModalViewModel } from '../viewmodel/modal.viewmodel';
import styles from './modal.view.module.css';

export function Modal({ isOpen, onClose, title, children, closeLabel = 'Fechar' }: ModalProps) {
  const { sheetRef, titleId, handleScrimClick } = useModalViewModel({ isOpen, onClose });

  if (!isOpen) {
    return null;
  }

  // Through a portal so the sheet is never trapped by an ancestor's stacking
  // context or overflow — the grid it is opened from is a scrolling container.
  return createPortal(
    <div className={styles.scrim} onClick={handleScrimClick}>
      <div
        className={styles.sheet}
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.head}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            {/* Authored SVG, not a glyph — DESIGN.md §Iconography. The button's
                aria-label is the accessible name either way. */}
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

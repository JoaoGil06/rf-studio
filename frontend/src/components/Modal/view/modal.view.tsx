import { createPortal } from 'react-dom';
import { CloseIcon } from '../../icons';
import type { ModalProps } from '../types/modal.types';
import { useModalViewModel } from '../viewmodel/modal.viewmodel';
import styles from './modal.view.module.css';

export function Modal({
  isOpen,
  onClose,
  title,
  whisper,
  children,
  closeLabel = 'Fechar',
}: ModalProps) {
  const { sheetRef, titleId, whisperId, handleScrimClick } = useModalViewModel({ isOpen, onClose });

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className={styles.scrim} onClick={handleScrimClick}>
      <div
        className={styles.sheet}
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={whisper ? `${whisperId} ${titleId}` : titleId}
        tabIndex={-1}
      >
        <div className={styles.head}>
          <div className={styles.heading}>
            {whisper && (
              <div className={styles.whisper} id={whisperId}>
                {whisper}
              </div>
            )}
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

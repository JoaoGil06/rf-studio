import type { PageHeaderProps } from '../types/pageHeader.types';
import styles from './pageHeader.view.module.css';

export function PageHeader({ whisper, title, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <div className={styles.whisper} aria-hidden="true">
          {whisper}
        </div>
        <h1 className={styles.display}>{title}</h1>
      </div>

      {children}
    </header>
  );
}

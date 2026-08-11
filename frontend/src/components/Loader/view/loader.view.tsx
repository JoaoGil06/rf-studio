import type { LoaderProps } from '../types/loader.types';
import styles from './loader.view.module.css';

const DEFAULT_LABEL = 'A carregar…';

export function Loader({ label = DEFAULT_LABEL }: LoaderProps) {
  return (
    <p className={styles.loader} role="status">
      <span className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
      {label}
    </p>
  );
}

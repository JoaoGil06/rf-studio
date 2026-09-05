import type { ClientRowProps } from '../types/clientRow.types';
import { useClientRowViewModel } from '../viewmodel/clientRow.viewmodel';
import styles from './clientRow.view.module.css';

export function ClientRow({ id }: ClientRowProps) {
  const viewModel = useClientRowViewModel(id);

  if (!viewModel) {
    return null;
  }

  return (
    <article className={styles.row}>
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
    </article>
  );
}

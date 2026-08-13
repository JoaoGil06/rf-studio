import type { ServiceCardProps } from '../types/serviceCard.types';
import { useServiceCardViewModel } from '../viewmodel/serviceCard.viewmodel';
import styles from './serviceCard.view.module.css';

export function ServiceCard({ id }: ServiceCardProps) {
  const viewModel = useServiceCardViewModel(id);

  if (!viewModel) {
    return null;
  }

  return (
    <article className={styles.card}>
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

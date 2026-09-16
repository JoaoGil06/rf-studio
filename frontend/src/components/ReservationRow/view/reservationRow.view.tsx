import type { ReservationRowProps } from '../types/reservationRow.types';
import { useReservationRowViewModel } from '../viewmodel/reservationRow.viewmodel';
import styles from './reservationRow.view.module.css';

export function ReservationRow({ id }: ReservationRowProps) {
  const row = useReservationRowViewModel(id);

  if (!row) {
    return null;
  }

  return (
    <article className={styles.row} aria-label={row.description}>
      <span className={styles.badge} data-status={row.statusValue}>
        {row.statusLabel}
      </span>

      <div className={styles.body}>
        <div className={styles.title}>{row.title}</div>
        <div className={styles.service}>{row.serviceName}</div>
      </div>

      <span className={styles.when}>{row.when}</span>
    </article>
  );
}

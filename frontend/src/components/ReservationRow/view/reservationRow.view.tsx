import { useCallback } from 'react';
import type {
  ReservationActionPillProps,
  ReservationRowProps,
} from '../types/reservationRow.types';
import { useReservationRowViewModel } from '../viewmodel/reservationRow.viewmodel';
import styles from './reservationRow.view.module.css';

function ReservationActionPill({
  id,
  kind,
  label,
  accessibleLabel,
  isDanger,
  onAction,
}: ReservationActionPillProps) {
  const handleClick = useCallback(() => onAction(id, kind), [onAction, id, kind]);

  return (
    <button
      type="button"
      className={styles.action}
      data-kind={kind}
      data-danger={isDanger}
      aria-label={accessibleLabel}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}

export function ReservationRow({ id, onAction }: ReservationRowProps) {
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

      {row.actions.length > 0 && (
        <div className={styles.actions}>
          {row.actions.map((action) => (
            <ReservationActionPill
              key={action.kind}
              id={id}
              kind={action.kind}
              label={action.label}
              accessibleLabel={action.accessibleLabel}
              isDanger={action.isDanger}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </article>
  );
}

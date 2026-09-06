import { useMemo } from 'react';
import type { ReservationEntryProps } from '../types/reservationEntry.types';
import { useReservationEntryViewModel } from '../viewmodel/reservationEntry.viewmodel';
import styles from './reservationEntry.view.module.css';

export function ReservationEntry({ id, density }: ReservationEntryProps) {
  const entry = useReservationEntryViewModel(id, density);

  const className = useMemo(() => (density === 'dense' ? styles.dense : styles.read), [density]);

  if (!entry) {
    return null;
  }

  return (
    <span
      className={className}
      data-status={entry.statusValue}
      title={entry.label}
      aria-label={entry.description}
      role="listitem"
    >
      {entry.label}
    </span>
  );
}

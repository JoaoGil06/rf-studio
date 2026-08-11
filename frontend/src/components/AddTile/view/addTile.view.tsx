import { useMemo } from 'react';
import { PlusIcon } from '../../icons';
import type { AddTileProps } from '../types/addTile.types';
import styles from './addTile.view.module.css';

export function AddTile({ label, onClick, ref }: AddTileProps) {
  const displayLabel = useMemo(() => label.toUpperCase(), [label]);

  return (
    <button type="button" ref={ref} className={styles.tile} onClick={onClick}>
      <PlusIcon className={styles.icon} />
      <span className={styles.label}>{displayLabel}</span>
    </button>
  );
}

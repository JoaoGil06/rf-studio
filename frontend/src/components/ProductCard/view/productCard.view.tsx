import { useMemo } from 'react';
import type { ProductCardProps } from '../types/productCard.types';
import { useProductCardViewModel } from '../viewmodel/productCard.viewmodel';
import styles from './productCard.view.module.css';

interface SwatchProps {
  colour: string | null;
  initial: string;
}

function Swatch({ colour, initial }: SwatchProps) {
  const style = useMemo(() => (colour ? { background: colour } : undefined), [colour]);

  const className = useMemo(
    () => (colour ? styles.swatch : `${styles.swatch} ${styles.swatchFallback}`),
    [colour],
  );

  return (
    <span className={className} style={style} aria-hidden="true">
      {colour ? null : initial}
    </span>
  );
}

export function ProductCard({ id }: ProductCardProps) {
  const viewModel = useProductCardViewModel(id);

  if (!viewModel) {
    return null;
  }

  return (
    <article className={styles.card}>
      <Swatch colour={viewModel.swatchColour} initial={viewModel.initial} />
      <span className={styles.swatchLabel}>{viewModel.swatchLabel}</span>

      <div>
        <div className={styles.name}>{viewModel.name}</div>
        <div className={styles.meta}>{viewModel.metaLabel}</div>
      </div>

      <div className={styles.brand}>{viewModel.brand}</div>

      {!viewModel.isAvailable && <span className={styles.veil} aria-hidden="true" />}
    </article>
  );
}

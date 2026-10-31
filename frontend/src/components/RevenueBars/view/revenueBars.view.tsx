import { useMemo } from 'react';
import type { RevenueBar, RevenueBarsProps } from '../types/revenueBars.types';
import styles from './revenueBars.view.module.css';

function RevenueBarColumn({ bar }: { bar: RevenueBar }) {
  // The bar's height is the data itself, so it is the one inline value here.
  const fillStyle = useMemo(() => ({ height: `${bar.heightPercent}%` }), [bar.heightPercent]);

  return (
    <li
      className={styles.column}
      aria-label={bar.spokenLabel}
      aria-current={bar.isSelected ? 'true' : undefined}
      title={bar.spokenLabel}
    >
      <span className={styles.value} aria-hidden="true">
        {bar.value}
      </span>
      <span className={styles.well} aria-hidden="true">
        {bar.heightPercent > 0 && (
          <span className={styles.fill} style={fillStyle} data-testid="bar-fill" />
        )}
      </span>
      <span className={styles.label} aria-hidden="true">
        {bar.label}
      </span>
    </li>
  );
}

export function RevenueBars({ bars }: RevenueBarsProps) {
  return (
    <ol className={styles.bars}>
      {bars.map((bar) => (
        <RevenueBarColumn key={bar.key} bar={bar} />
      ))}
    </ol>
  );
}

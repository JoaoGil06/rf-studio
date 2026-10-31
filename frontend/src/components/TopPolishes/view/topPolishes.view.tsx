import { useMemo } from 'react';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import type { TopPolishRowProps, TopPolishesProps } from '../types/topPolishes.types';
import styles from './topPolishes.view.module.css';

function TopPolishRow({ polish }: TopPolishRowProps) {
  // The polish's own colour is content, not layout, so it is allowed to be inline.
  const swatchStyle = useMemo(() => ({ background: polish.colour }), [polish.colour]);

  const barStyle = useMemo(
    () => ({ width: `${polish.barPercent}%`, background: polish.colour }),
    [polish.barPercent, polish.colour],
  );

  return (
    <li className={styles.row}>
      <span className={styles.swatch} style={swatchStyle} data-testid="swatch" aria-hidden="true" />
      <span className={styles.label}>{polish.label}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.bar} style={barStyle} data-testid="polish-bar" />
      </span>
      <span className={styles.count}>{polish.count}</span>
    </li>
  );
}

export function TopPolishes({ polishes }: TopPolishesProps) {
  if (polishes.length === 0) {
    return <p className={styles.empty}>{DASHBOARD_COPY.topPolishesEmpty}</p>;
  }

  return (
    <ol className={styles.list}>
      {polishes.map((polish) => (
        <TopPolishRow key={polish.id} polish={polish} />
      ))}
    </ol>
  );
}

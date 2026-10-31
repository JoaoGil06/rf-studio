import { useMemo } from 'react';
import { DASHBOARD_COPY } from '../../../utils/constants/dashboardMessages';
import type { CategorySplitProps } from '../types/categorySplit.types';
import styles from './categorySplit.view.module.css';

export function CategorySplit({ split }: CategorySplitProps) {
  const nailsPercent = split?.nailsPercent ?? 0;
  const browsPercent = split?.browsPercent ?? 0;

  // Each side's share is the data itself, so the widths are the only inline values here.
  const nailsStyle = useMemo(() => ({ width: `${nailsPercent}%` }), [nailsPercent]);
  const browsStyle = useMemo(() => ({ width: `${browsPercent}%` }), [browsPercent]);

  return (
    <div className={styles.split}>
      <div className={styles.title}>{DASHBOARD_COPY.splitTitle}</div>

      {split ? (
        <>
          {/* Hidden from assistive tech: the legend below says the same thing in words. */}
          <div className={styles.track} aria-hidden="true">
            {nailsPercent > 0 && (
              <div className={styles.nails} style={nailsStyle} data-testid="split-nails" />
            )}
            {browsPercent > 0 && (
              <div className={styles.brows} style={browsStyle} data-testid="split-brows" />
            )}
          </div>

          <ul className={styles.legend}>
            <li className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.nails}`} aria-hidden="true" />
              {split.nailsLabel}
            </li>
            <li className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.brows}`} aria-hidden="true" />
              {split.browsLabel}
            </li>
          </ul>
        </>
      ) : (
        <p className={styles.empty}>{DASHBOARD_COPY.splitEmpty}</p>
      )}
    </div>
  );
}

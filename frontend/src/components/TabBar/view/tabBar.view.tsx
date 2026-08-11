import { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '../../../utils/constants/navigation';
import { PATHS } from '../../../routes/paths';
import styles from './tabBar.view.module.css';

export function TabBar() {
  const tabClassName = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab,
    [],
  );

  return (
    <nav className={styles.tabbar} aria-label="Secções">
      {NAV_SECTIONS.map((section) => {
        const Icon = section.icon;

        return (
          <NavLink
            key={section.key}
            to={section.path}
            end={section.path === PATHS.agenda}
            className={tabClassName}
          >
            <Icon className={styles.tabIcon} />
            <span className={styles.tabLabel}>{section.tabLabel}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

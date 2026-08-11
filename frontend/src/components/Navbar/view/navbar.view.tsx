import { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '../../../utils/constants/navigation';
import { PATHS } from '../../../routes/paths';
import { MoonIcon, SunIcon } from '../../icons';
import { useNavbarViewModel } from '../viewmodel/navbar.viewmodel';
import styles from './navbar.view.module.css';

export function Navbar() {
  const { initial, isDark, themeLabel, themeAria, toggleTheme, handleSignOut } =
    useNavbarViewModel();

  const linkClassName = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      isActive ? `${styles.link} ${styles.linkActive}` : styles.link,
    [],
  );

  return (
    <header className={styles.topbar}>
      <NavLink to={PATHS.agenda} className={styles.brand}>
        <span className={styles.brandMark}>RF</span>
        <span className={styles.brandWord}>STUDIO</span>
      </NavLink>

      <nav className={styles.nav} aria-label="Secções">
        {NAV_SECTIONS.map((section) => (
          <NavLink
            key={section.key}
            to={section.path}
            end={section.path === PATHS.agenda}
            className={linkClassName}
          >
            {section.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.utilities}>
        <button
          type="button"
          className={styles.themeButton}
          onClick={toggleTheme}
          aria-label={themeAria}
        >
          {isDark ? (
            <MoonIcon className={styles.themeIcon} />
          ) : (
            <SunIcon className={styles.themeIcon} />
          )}
          <span className={styles.themeLabel}>{themeLabel}</span>
        </button>

        <button type="button" className={styles.signOut} onClick={handleSignOut}>
          SAIR
        </button>

        <div className={styles.avatar} aria-hidden="true">
          {initial}
        </div>
      </div>
    </header>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  THEME_STORAGE_KEY,
  THEME_SWEEP_MS,
  ThemeContext,
  type Theme,
  type ThemeContextValue,
} from './theme.context';

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function readPreferredTheme(): Theme {
  if (typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? readPreferredTheme());

  const sweepTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Private mode or quota exhausted — the theme still applies for this
      // session, it just will not survive a refresh.
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (sweepTimeout.current !== null) clearTimeout(sweepTimeout.current);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('rf-theming');

    if (sweepTimeout.current !== null) clearTimeout(sweepTimeout.current);
    sweepTimeout.current = setTimeout(() => {
      root.classList.remove('rf-theming');
      sweepTimeout.current = null;
    }, THEME_SWEEP_MS);

    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

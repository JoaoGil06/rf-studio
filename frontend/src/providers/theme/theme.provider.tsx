import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { themeStorage } from '../../lib/adapters/theme-storage/theme-storage.adapter';
import type { Theme } from '../../lib/adapters/theme-storage/theme-storage.interface';
import { THEME_SWEEP_MS, ThemeContext, type ThemeContextValue } from './theme.context';

function readPreferredTheme(): Theme {
  if (typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => themeStorage.get() ?? readPreferredTheme());

  const sweepTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    themeStorage.set(theme);
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

import { createContext } from 'react';
import type { Theme } from '../../lib/adapters/theme-storage/theme-storage.interface';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * `THEME_STORAGE_KEY` now lives with the adapter that owns it. What stays here is
 * the one constant the UI genuinely shares: the sweep window must outlast the CSS
 * transition it guards, so it is declared once instead of being duplicated
 * between the provider and the stylesheet.
 */
export const THEME_SWEEP_MS = 320;

import { createStorageGuard } from '../safe-storage';
import type { IThemeStorage, Theme } from './theme-storage.interface';

export const THEME_STORAGE_KEY = 'rf-theme';

const guard = createStorageGuard('themeStorage');

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export const themeStorage: IThemeStorage = {
  get: () =>
    guard.read(
      'read',
      () => {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isTheme(stored) ? stored : null;
      },
      null,
    ),

  set: (theme) =>
    guard.mutate('write', () => window.localStorage.setItem(THEME_STORAGE_KEY, theme)),
};

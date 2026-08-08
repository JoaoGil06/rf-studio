export type Theme = 'light' | 'dark';

export interface IThemeStorage {
  get(): Theme | null;
  set(theme: Theme): void;
}

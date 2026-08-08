import { THEME_STORAGE_KEY, themeStorage } from './theme-storage.adapter';

beforeEach(() => {
  window.localStorage.clear();

  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('themeStorage', () => {
  it('returns null when nothing is stored', () => {
    expect(themeStorage.get()).toBeNull();
  });

  it('round-trips a theme through set/get', () => {
    themeStorage.set('dark');

    expect(themeStorage.get()).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('returns null for a value that is not a known theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'lacquer');

    expect(themeStorage.get()).toBeNull();
  });

  it('returns null instead of throwing when the read is refused', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(themeStorage.get()).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[themeStorage] read failed'),
      expect.any(Error),
    );
  });

  it('swallows a throwing setItem but says so, so a blocked origin is visible', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => themeStorage.set('dark')).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[themeStorage] write failed'),
      expect.any(Error),
    );
  });
});

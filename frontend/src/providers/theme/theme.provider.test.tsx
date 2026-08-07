import { act, fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from '../../hooks/useTheme';
import { THEME_STORAGE_KEY, THEME_SWEEP_MS } from './theme.context';
import { ThemeProvider } from './theme.provider';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

/** jsdom has no matchMedia; install one that reports the given preference. */
function stubPrefersDark(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('rf-theming');
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('ThemeProvider', () => {
  it('uses the persisted theme when one is stored', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    renderProbe();

    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('ignores a stored value that is not a known theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'lacquer');
    stubPrefersDark(false);

    renderProbe();

    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('falls back to prefers-color-scheme when nothing is stored', () => {
    stubPrefersDark(true);

    renderProbe();

    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('falls back to light when matchMedia is unavailable', () => {
    renderProbe();

    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('toggleTheme flips data-theme on the root element', () => {
    renderProbe();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('persists the choice across a remount', () => {
    const first = renderProbe();
    fireEvent.click(screen.getByRole('button'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    first.unmount();

    renderProbe();

    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });

  it('arms the sweep class for the duration of the swap and then removes it', () => {
    vi.useFakeTimers();
    try {
      renderProbe();

      fireEvent.click(screen.getByRole('button'));
      expect(document.documentElement).toHaveClass('rf-theming');

      act(() => {
        vi.advanceTimersByTime(THEME_SWEEP_MS);
      });
      expect(document.documentElement).not.toHaveClass('rf-theming');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Probe />)).toThrow(/must be used inside ThemeProvider/);
    } finally {
      consoleError.mockRestore();
    }
  });
});

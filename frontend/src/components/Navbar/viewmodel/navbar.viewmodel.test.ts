import { renderHook } from '@testing-library/react';
import type { StoredUser } from '../../../lib/adapters/auth-storage/auth-storage.interface';
import { useNavbarViewModel } from './navbar.viewmodel';

const signOutMock = vi.fn();
const toggleThemeMock = vi.fn();
const useAuthMock = vi.fn();
const useThemeMock = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../../hooks/useTheme', () => ({
  useTheme: () => useThemeMock(),
}));

const rita: StoredUser = {
  id: 'user-1',
  name: 'Rita Ferreira',
  email: 'rita@rfstudio.pt',
  roleName: 'Admin',
};

function setUp(user: StoredUser | null = rita, theme: 'light' | 'dark' = 'light') {
  useAuthMock.mockReturnValue({
    user,
    isAuthenticated: user !== null,
    signIn: vi.fn(),
    signOut: signOutMock,
  });
  useThemeMock.mockReturnValue({ theme, toggleTheme: toggleThemeMock });

  return renderHook(() => useNavbarViewModel());
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNavbarViewModel', () => {
  describe('the avatar initial', () => {
    it('takes the first character of the name', () => {
      const { result } = setUp();

      expect(result.current.initial).toBe('R');
    });

    it('uppercases a lowercase name', () => {
      const { result } = setUp({ ...rita, name: 'rita' });

      expect(result.current.initial).toBe('R');
    });

    it('trims leading whitespace before taking the character', () => {
      const { result } = setUp({ ...rita, name: '  Rita' });

      expect(result.current.initial).toBe('R');
    });

    it('falls back to the email when the name is empty', () => {
      const { result } = setUp({ ...rita, name: '' });

      expect(result.current.initial).toBe('R');
    });

    it('falls back to the email when the name is only whitespace', () => {
      const { result } = setUp({ ...rita, name: '   ', email: 'contacto@rfstudio.pt' });

      expect(result.current.initial).toBe('C');
    });

    it('renders a placeholder when there is no user at all', () => {
      const { result } = setUp(null);

      expect(result.current.initial).toBe('·');
    });
  });

  describe('the theme control', () => {
    it('labels the current theme in light', () => {
      const { result } = setUp(rita, 'light');

      expect(result.current.isDark).toBe(false);
      expect(result.current.themeLabel).toBe('CLARO');
    });

    it('labels the current theme in dark', () => {
      const { result } = setUp(rita, 'dark');

      expect(result.current.isDark).toBe(true);
      expect(result.current.themeLabel).toBe('ESCURO');
    });

    it('announces the destination theme, not the current one', () => {
      const { result: light } = setUp(rita, 'light');
      expect(light.current.themeAria).toBe('Mudar para tema escuro');

      const { result: dark } = setUp(rita, 'dark');
      expect(dark.current.themeAria).toBe('Mudar para tema claro');
    });

    it('passes the provider toggle straight through', () => {
      const { result } = setUp();

      result.current.toggleTheme();

      expect(toggleThemeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('signing out', () => {
    it('calls the auth context', () => {
      const { result } = setUp();

      result.current.handleSignOut();

      expect(signOutMock).toHaveBeenCalledTimes(1);
    });
  });
});

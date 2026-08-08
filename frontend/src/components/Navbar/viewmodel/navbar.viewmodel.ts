import { useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

const NO_INITIAL = '·';

export function useNavbarViewModel() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initial = useMemo(() => {
    const source = user?.name.trim() || user?.email.trim() || '';
    return source.charAt(0).toUpperCase() || NO_INITIAL;
  }, [user]);

  const isDark = useMemo(() => theme === 'dark', [theme]);

  const themeLabel = useMemo(() => (isDark ? 'ESCURO' : 'CLARO'), [isDark]);

  const themeAria = useMemo(
    () => (isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'),
    [isDark],
  );

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  return { initial, isDark, themeLabel, themeAria, toggleTheme, handleSignOut };
}

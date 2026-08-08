import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../providers/auth/auth.context';
import { ProtectedRoute } from './ProtectedRoute';
import { PATHS } from './paths';

function buildAuth(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    isAuthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  };
}

/** Renders the location the guard redirected to, plus whatever it carried. */
function LoginProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { from?: string } | null;

  return (
    <div>
      <span data-testid="login">login</span>
      <span data-testid="from">{state?.from ?? '—'}</span>
      <button type="button" onClick={() => void navigate(-1)}>
        voltar
      </button>
    </div>
  );
}

function renderGuard(auth: AuthContextValue, initialPath = '/reservations') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/', initialPath]} initialIndex={1}>
        <Routes>
          <Route path={PATHS.login} element={<LoginProbe />} />
          <Route path={PATHS.agenda} element={<span data-testid="agenda">agenda</span>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/reservations" element={<span data-testid="guarded">reservas</span>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    renderGuard(buildAuth({ isAuthenticated: false }));

    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(screen.queryByTestId('guarded')).not.toBeInTheDocument();
  });

  it('carries the requested path in the redirect state', () => {
    renderGuard(buildAuth({ isAuthenticated: false }));

    expect(screen.getByTestId('from')).toHaveTextContent('/reservations');
  });

  it('replaces the guarded entry so back does not bounce', () => {
    renderGuard(buildAuth({ isAuthenticated: false }));

    // With `replace` the guarded entry is gone, so going back lands on the entry
    // before it. Without it, back would return to /reservations and redirect again.
    act(() => {
      screen.getByRole('button', { name: 'voltar' }).click();
    });

    expect(screen.getByTestId('agenda')).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('renders the routed child when authenticated', () => {
    renderGuard(
      buildAuth({
        isAuthenticated: true,
        user: { id: 'user-1', name: 'Rita', email: 'rita@rfstudio.pt', roleName: 'Admin' },
      }),
    );

    expect(screen.getByTestId('guarded')).toBeInTheDocument();
  });
});

import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../providers/auth/auth.context';
import { GuestRoute } from './GuestRoute';
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

const rita = { id: 'user-1', name: 'Rita', email: 'rita@rfstudio.pt', roleName: 'Admin' };

/** Renders the agenda plus a way to walk back, so `replace` can be observed. */
function AgendaProbe() {
  const navigate = useNavigate();

  return (
    <div>
      <span data-testid="agenda">agenda</span>
      <button type="button" onClick={() => void navigate(-1)}>
        voltar
      </button>
    </div>
  );
}

function renderGuard(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/reservations', PATHS.login]} initialIndex={1}>
        <Routes>
          <Route path={PATHS.agenda} element={<AgendaProbe />} />
          <Route path="/reservations" element={<span data-testid="reservations">reservas</span>} />
          <Route element={<GuestRoute />}>
            <Route path={PATHS.login} element={<span data-testid="login">login</span>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('GuestRoute', () => {
  it('renders the login page when there is no session', () => {
    renderGuard(buildAuth({ isAuthenticated: false }));

    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(screen.queryByTestId('agenda')).not.toBeInTheDocument();
  });

  it('redirects an authenticated user away from /login', () => {
    renderGuard(buildAuth({ isAuthenticated: true, user: rita }));

    expect(screen.getByTestId('agenda')).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('decides on the first render, without ever showing the form', () => {
    // The regression this exists to catch: while the session was hydrated in an
    // effect, the form rendered for a frame before the redirect landed.
    const { container } = renderGuard(buildAuth({ isAuthenticated: true, user: rita }));

    expect(container.querySelector('[data-testid="login"]')).toBeNull();
  });

  it('replaces the /login entry so back does not bounce', () => {
    renderGuard(buildAuth({ isAuthenticated: true, user: rita }));

    // With `replace` the /login entry is gone, so going back lands on the entry
    // before it. Without it, back would return to /login and redirect again.
    act(() => {
      screen.getByRole('button', { name: 'voltar' }).click();
    });

    expect(screen.getByTestId('reservations')).toBeInTheDocument();
    expect(screen.queryByTestId('agenda')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../../../providers/auth/auth.context';
import { ThemeContext, type ThemeContextValue } from '../../../providers/theme/theme.context';
import { PATHS } from '../../paths';
import { routes } from '../..';

vi.mock('../../../pages/Login', () => ({
  LoginView: () => <span data-testid="login-page">login</span>,
}));

const auth: AuthContextValue = {
  user: { id: 'user-1', name: 'Rita Ferreira', email: 'rita@rfstudio.pt', roleName: 'Admin' },
  isAuthenticated: true,
  signIn: vi.fn(),
  signOut: vi.fn(),
};

const theme: ThemeContextValue = { theme: 'light', toggleTheme: vi.fn() };

function renderAt(path: string, session: AuthContextValue = auth) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return render(
    <AuthContext.Provider value={session}>
      <ThemeContext.Provider value={theme}>
        <RouterProvider router={router} />
      </ThemeContext.Provider>
    </AuthContext.Provider>,
  );
}

describe('AppLayout', () => {
  it('wraps the section in the topbar and the tab bar', () => {
    renderAt(PATHS.agenda);

    expect(screen.getAllByRole('navigation', { name: 'Secções' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Agenda' })).toBeInTheDocument();
  });

  it.each([
    [PATHS.agenda, 'Agenda'],
    [PATHS.dashboard, 'Dashboard'],
    [PATHS.reservations, 'Reservas'],
    [PATHS.products, 'Produtos'],
    [PATHS.services, 'Serviços'],
    [PATHS.clients, 'Clientes'],
  ])('renders %s inside the frame', (path, heading) => {
    renderAt(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeInTheDocument();
  });

  it('sends an unknown path back to the agenda', () => {
    renderAt('/nao-existe');

    expect(screen.getByRole('heading', { name: 'Agenda' })).toBeInTheDocument();
  });

  it('renders no frame on the login page', () => {
    renderAt(PATHS.login, { ...auth, user: null, isAuthenticated: false });

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Secções' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'SAIR' })).not.toBeInTheDocument();
  });

  it('sends a signed-out visitor to the login page instead of the frame', () => {
    renderAt(PATHS.clients, { ...auth, user: null, isAuthenticated: false });

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'SAIR' })).not.toBeInTheDocument();
  });
});

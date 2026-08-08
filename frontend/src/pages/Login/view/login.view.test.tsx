import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginView } from './login.view';

const loginMock = vi.fn();

vi.mock('../model/login.model', () => ({
  useLoginModel: () => ({ login: loginMock }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => vi.fn(),
}));

function renderView() {
  return render(
    <MemoryRouter>
      <LoginView />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * The page's own job is the frame and the wiring — the form's rendering is
 * covered against props in `components/LoginForm`. What is left to prove here is
 * that the ViewModel actually reaches the real component.
 */
describe('LoginView', () => {
  it('renders the logotype and the tagline', () => {
    renderView();

    expect(screen.getByText('Rita Ferreira')).toBeInTheDocument();
    expect(screen.getByText('NAILS AND BROWS DESIGNER')).toBeInTheDocument();
  });

  it('wires the ViewModel through to the form', async () => {
    loginMock.mockResolvedValue({
      data: { login: { __typename: 'InvalidCredentialsError', message: 'Invalid Credentials' } },
    });
    const user = userEvent.setup();
    renderView();

    await user.type(screen.getByLabelText('Email'), 'rita@rfstudio.pt');
    await user.type(screen.getByLabelText('Palavra-passe'), 'segredo123');
    await user.click(screen.getByRole('button', { name: 'ENTRAR' }));

    expect(loginMock).toHaveBeenCalledWith({
      variables: { input: { email: 'rita@rfstudio.pt', password: 'segredo123' } },
    });
  });
});

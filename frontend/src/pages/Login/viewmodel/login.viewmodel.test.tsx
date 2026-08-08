import { CombinedGraphQLErrors } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { LOGIN_ERROR_MESSAGES, useLoginViewModel } from './login.viewmodel';

const loginMock = vi.fn();
const signInMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../model/login.model', () => ({
  useLoginModel: () => ({ login: loginMock }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    signIn: signInMock,
    signOut: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}));

const successPayload = {
  data: {
    login: {
      __typename: 'LoginSuccess',
      token: 'jwt-token',
      user: {
        id: 'user-1',
        name: 'Rita Ferreira',
        email: 'rita@rfstudio.pt',
        role: { name: 'Admin' },
      },
    },
  },
};

const invalidPayload = {
  data: { login: { __typename: 'InvalidCredentialsError', message: 'Invalid Credentials' } },
};

/**
 * A headless harness, not the View: the ViewModel's form state only exists once
 * `register` is attached to real inputs, so validation and submit cannot be
 * exercised through `renderHook` alone.
 */
function Harness() {
  const { register, handleSubmit, submit, errors, formError, isSubmitting } = useLoginViewModel();

  return (
    <form onSubmit={handleSubmit(submit)}>
      <input aria-label="email" {...register('email')} />
      <span data-testid="email-error">{errors.email?.message ?? ''}</span>
      <input aria-label="password" type="password" {...register('password')} />
      <span data-testid="password-error">{errors.password?.message ?? ''}</span>
      <span data-testid="form-error">{formError ?? ''}</span>
      <button type="submit">{isSubmitting ? 'a entrar' : 'entrar'}</button>
    </form>
  );
}

function renderHarness(state?: { from: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: PATHS.login, state: state ?? null }]}>
      <Harness />
    </MemoryRouter>,
  );
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('email'), email);
  if (password) await user.type(screen.getByLabelText('password'), password);
  await user.click(screen.getByRole('button'));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useLoginViewModel', () => {
  it('signs in with the mapped user and lands on the agenda', async () => {
    loginMock.mockResolvedValue(successPayload);
    renderHarness();

    await fillAndSubmit('rita@rfstudio.pt', 'segredo123');

    expect(loginMock).toHaveBeenCalledWith({
      variables: { input: { email: 'rita@rfstudio.pt', password: 'segredo123' } },
    });
    expect(signInMock).toHaveBeenCalledWith({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        name: 'Rita Ferreira',
        email: 'rita@rfstudio.pt',
        roleName: 'Admin',
      },
    });
    expect(navigateMock).toHaveBeenCalledWith(PATHS.agenda, { replace: true });
  });

  it('returns to the page the guard bounced away from', async () => {
    loginMock.mockResolvedValue(successPayload);
    renderHarness({ from: '/clients' });

    await fillAndSubmit('rita@rfstudio.pt', 'segredo123');

    expect(navigateMock).toHaveBeenCalledWith('/clients', { replace: true });
  });

  it('maps InvalidCredentialsError to pt-PT copy and does not sign in', async () => {
    loginMock.mockResolvedValue(invalidPayload);
    renderHarness();

    await fillAndSubmit('rita@rfstudio.pt', 'errada');

    expect(screen.getByTestId('form-error')).toHaveTextContent(
      LOGIN_ERROR_MESSAGES.invalidCredentials,
    );
    expect(signInMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('never surfaces the backend English message', async () => {
    loginMock.mockResolvedValue(invalidPayload);
    const { container } = renderHarness();

    await fillAndSubmit('rita@rfstudio.pt', 'errada');

    expect(container.textContent).not.toContain('Invalid Credentials');
  });

  it('maps a thrown BAD_USER_INPUT to the check-your-details copy', async () => {
    loginMock.mockRejectedValue(
      new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'Invalid email', extensions: { code: 'BAD_USER_INPUT' } }],
      }),
    );
    renderHarness();

    await fillAndSubmit('rita@rfstudio.pt', 'segredo123');

    expect(screen.getByTestId('form-error')).toHaveTextContent(LOGIN_ERROR_MESSAGES.badInput);
  });

  it('maps a network failure to the connection copy', async () => {
    loginMock.mockRejectedValue(new Error('Failed to fetch'));
    renderHarness();

    await fillAndSubmit('rita@rfstudio.pt', 'segredo123');

    expect(screen.getByTestId('form-error')).toHaveTextContent(LOGIN_ERROR_MESSAGES.network);
  });

  it('rejects an empty email client-side without firing the mutation', async () => {
    renderHarness();

    await fillAndSubmit('', 'segredo123');

    expect(screen.getByTestId('email-error')).toHaveTextContent('Introduza o seu email.');
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed email client-side without firing the mutation', async () => {
    renderHarness();

    await fillAndSubmit('rita', 'segredo123');

    expect(screen.getByTestId('email-error')).toHaveTextContent('Email inválido.');
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('clears the previous error on the next submit', async () => {
    loginMock.mockResolvedValueOnce(invalidPayload).mockResolvedValueOnce(successPayload);
    renderHarness();

    await fillAndSubmit('rita@rfstudio.pt', 'errada');
    expect(screen.getByTestId('form-error')).toHaveTextContent(
      LOGIN_ERROR_MESSAGES.invalidCredentials,
    );

    await userEvent.setup().click(screen.getByRole('button'));

    expect(screen.getByTestId('form-error')).toBeEmptyDOMElement();
  });
});

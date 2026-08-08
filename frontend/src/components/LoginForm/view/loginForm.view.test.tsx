import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginFormValues } from '../types/loginForm.types';
import { LoginForm } from './loginForm.view';

/**
 * No Apollo client, no session, no router — the component takes everything it
 * needs as props. The harness supplies a real `useForm` because `register` has to
 * be attached to real inputs for validation to be observable at all.
 */
function Harness({
  formError = null,
  isSubmitting = false,
  onValid = vi.fn(),
}: {
  formError?: string | null;
  isSubmitting?: boolean;
  onValid?: (values: LoginFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  return (
    <LoginForm
      register={register}
      errors={errors}
      onSubmit={handleSubmit(onValid)}
      formError={formError}
      isSubmitting={isSubmitting}
    />
  );
}

describe('LoginForm', () => {
  it('labels the card', () => {
    render(<Harness />);

    expect(screen.getByText('ÁREA DE ADMINISTRAÇÃO')).toBeInTheDocument();
  });

  it('gives both fields a visible, accessible name', () => {
    render(<Harness />);

    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Palavra-passe');

    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
  });

  it('shows both pt-PT validation messages when submitted empty', async () => {
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'ENTRAR' }));

    expect(await screen.findByText('Introduza o seu email.')).toBeInTheDocument();
    expect(screen.getByText('Introduza a palavra-passe.')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('describes an invalid field with its own message', async () => {
    render(<Harness />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'ENTRAR' }));

    const email = await screen.findByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Introduza o seu email.');
  });

  it('announces the form-level error through role="alert"', () => {
    render(<Harness formError="Não foi possível ligar ao servidor. Tente novamente." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível ligar ao servidor. Tente novamente.',
    );
  });

  it('renders no alert when there is no form-level error', () => {
    render(<Harness />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables and relabels the button while submitting', () => {
    render(<Harness isSubmitting />);

    expect(screen.getByRole('button', { name: 'A ENTRAR…' })).toBeDisabled();
  });

  it('submits exactly once when Enter is pressed in the password field', async () => {
    const onValid = vi.fn();
    const user = userEvent.setup();
    render(<Harness onValid={onValid} />);

    await user.type(screen.getByLabelText('Email'), 'rita@rfstudio.pt');
    await user.type(screen.getByLabelText('Palavra-passe'), 'segredo123{Enter}');

    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
  });
});

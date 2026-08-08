import { CombinedGraphQLErrors } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  loginSchema,
  type LoginFormValues,
} from '../../../components/LoginForm/types/loginForm.types';
import { useAuth } from '../../../hooks/useAuth';
import { DEFAULT_SIGNED_IN_PATH } from '../../../routes/paths';
import { useLoginModel } from '../model/login.model';

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'Email ou palavra-passe incorretos.',
  badInput: 'Verifique o email e a palavra-passe.',
  network: 'Não foi possível ligar ao servidor. Tente novamente.',
} as const;

export function useLoginViewModel() {
  const { login } = useLoginModel();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  // The page the guard bounced away from, so sign-in returns her to what she asked
  // for rather than to the default landing page.
  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? null;
  }, [location.state]);

  const submit = useCallback(
    async (values: LoginFormValues) => {
      try {
        const { data } = await login({ variables: { input: values } });

        if (!data) {
          setError('root', { message: LOGIN_ERROR_MESSAGES.network });
          return;
        }

        switch (data.login.__typename) {
          case 'LoginSuccess':
            signIn({
              token: data.login.token,
              user: {
                id: data.login.user.id,
                name: data.login.user.name,
                email: data.login.user.email,
                roleName: data.login.user.role.name,
              },
            });
            // `replace` so back does not land on the login screen while signed in.
            await navigate(from ?? DEFAULT_SIGNED_IN_PATH, { replace: true });
            return;

          case 'InvalidCredentialsError':
            setError('root', { message: LOGIN_ERROR_MESSAGES.invalidCredentials });
            return;
        }
      } catch (error) {
        const isBadUserInput =
          CombinedGraphQLErrors.is(error) &&
          error.errors.some((graphQLError) => graphQLError.extensions?.code === 'BAD_USER_INPUT');

        setError('root', {
          message: isBadUserInput ? LOGIN_ERROR_MESSAGES.badInput : LOGIN_ERROR_MESSAGES.network,
        });
      }
    },
    [login, signIn, navigate, from, setError],
  );

  const formError = useMemo(() => errors.root?.message ?? null, [errors.root]);

  return { register, handleSubmit, submit, errors, formError, isSubmitting };
}

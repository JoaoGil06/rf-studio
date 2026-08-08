import { useMemo } from 'react';
import type { LoginFormProps } from '../types/loginForm.types';
import styles from './loginForm.view.module.css';

const EMAIL_ERROR_ID = 'login-email-error';
const PASSWORD_ERROR_ID = 'login-password-error';

export function LoginForm({ register, errors, onSubmit, formError, isSubmitting }: LoginFormProps) {
  const submitLabel = useMemo(() => (isSubmitting ? 'A ENTRAR…' : 'ENTRAR'), [isSubmitting]);

  return (
    /*
      `noValidate` hands validation to zod: the browser's native bubbles are in the
      user's UI language, not necessarily pt-PT, and they fire before the resolver
      ever runs. The button carries `type="submit"` and no `onClick` — the
      prototype had both, which fires the handler twice in React.
    */
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <p className={styles.cardLabel}>ÁREA DE ADMINISTRAÇÃO</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="login-email">
          Email
        </label>
        <input
          className={styles.input}
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? EMAIL_ERROR_ID : undefined}
          {...register('email')}
        />
        {errors.email && (
          <span className={styles.fieldError} id={EMAIL_ERROR_ID}>
            {errors.email.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="login-password">
          Palavra-passe
        </label>
        <input
          className={styles.input}
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? PASSWORD_ERROR_ID : undefined}
          {...register('password')}
        />
        {errors.password && (
          <span className={styles.fieldError} id={PASSWORD_ERROR_ID}>
            {errors.password.message}
          </span>
        )}
      </div>

      {formError && (
        <div className={styles.formError} role="alert">
          {formError}
        </div>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {submitLabel}
      </button>
    </form>
  );
}

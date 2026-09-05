import { useId, useMemo } from 'react';
import type { ClientFormProps } from '../types/clientForm.types';
import styles from './clientForm.view.module.css';

export function ClientForm({
  register,
  errors,
  onSubmit,
  formError,
  isSubmitting,
  submitLabel,
  busyLabel,
  layout,
}: ClientFormProps) {
  const label = useMemo(
    () => (isSubmitting ? busyLabel : submitLabel),
    [isSubmitting, busyLabel, submitLabel],
  );

  const formClassName = useMemo(
    () => (layout === 'stacked' ? `${styles.form} ${styles.formPlain}` : styles.form),
    [layout],
  );

  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const emailId = `${fieldId}-email`;
  const phoneId = `${fieldId}-phone`;
  const nameErrorId = `${nameId}-error`;
  const emailErrorId = `${emailId}-error`;
  const phoneErrorId = `${phoneId}-error`;

  return (
    <form className={formClassName} onSubmit={onSubmit} noValidate>
      <div className={styles.bar}>
        <div className={styles.fieldName}>
          <label className={styles.label} htmlFor={nameId}>
            Nome da cliente
          </label>
          <input
            className={styles.input}
            id={nameId}
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? nameErrorId : undefined}
            {...register('name')}
          />
          {errors.name && (
            <span className={styles.fieldError} id={nameErrorId}>
              {errors.name.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            Email
          </label>
          <input
            className={styles.input}
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
            {...register('email')}
          />
          {errors.email && (
            <span className={styles.fieldError} id={emailErrorId}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={phoneId}>
            Telemóvel
          </label>
          <input
            className={styles.input}
            id={phoneId}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={errors.phoneNumber ? true : undefined}
            aria-describedby={errors.phoneNumber ? phoneErrorId : undefined}
            {...register('phoneNumber')}
          />
          {errors.phoneNumber && (
            <span className={styles.fieldError} id={phoneErrorId}>
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {label}
        </button>
      </div>

      {formError && (
        <div className={styles.formError} role="alert">
          {formError}
        </div>
      )}
    </form>
  );
}
